import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, switchMap, throwError, from, lastValueFrom } from "rxjs";
import { RefreshTokenResponse } from "../model/auth-model";
import { AuthService } from "../auth-service/authentification.service";
import { inject } from "@angular/core";

let refreshingToken = false;
let refreshTokenPromise: Promise<string | null> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const excludedUrls = ['/login', '/register', '/refresh-token','/create-account'];
  if (excludedUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = authService.getAccessToken();

  if (token) {
   // const refreshToken = authService.getRefreshToken();

    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` ,
      //...(refreshToken && !refreshingToken ? { 'Refresh-Token': `Bearer ${refreshToken}` } : {})

    },
    });
  }

  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.getRefreshToken()) {
        // Si nous ne sommes pas déjà en train de rafraîchir le token
        if (!refreshingToken) {
          refreshingToken = true;
          refreshTokenPromise = lastValueFrom(authService.refreshToken())
            .then((response: RefreshTokenResponse) => {
              authService.setAccessToken(response.accessToken); // Met à jour le token d'accès
              return response.accessToken; // Retourne le nouveau token d'accès
            })
            .catch(() => {
              console.log('Token refresh failed, logging out');
              authService.logout(); // Si le rafraîchissement échoue, déconnecte l'utilisateur
              return null;
            })
            .finally(() => {
              refreshingToken = false; // Réinitialise l'état de rafraîchissement du token
              refreshTokenPromise = null; // Réinitialise la promesse
            });
        }
  
        // Attends le résultat de la promesse de rafraîchissement du token
        return from(refreshTokenPromise!).pipe(
          switchMap((newAccessToken) => {
            // Si un nouveau token d'accès a été obtenu
            if (newAccessToken) {
              const authReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newAccessToken}` }, // Ajoute le token d'accès aux en-têtes
              });
              return next(authReq); // Réexécute la requête avec le nouveau token
            } else {
              return throwError(() => new Error("Unauthorized"));
            }
          })
        );
      }
  
      // Si l'erreur n'est pas liée à un token expiré, renvoie l'erreur initiale
      return throwError(() => error);
    })
  );
}  