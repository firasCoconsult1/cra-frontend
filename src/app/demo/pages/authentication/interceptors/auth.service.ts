import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, switchMap, throwError, from, lastValueFrom } from "rxjs";
import { RefreshTokenResponse } from "../model/auth-model";
import { AuthService } from "../auth-service/authentification.service";
import { inject } from "@angular/core";

let refreshingToken = false;
let refreshTokenPromise: Promise<string | null> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.getRefreshToken() && !req.url.includes('/refresh-token')) {
        
        if (!refreshingToken) {
          refreshingToken = true;
          refreshTokenPromise = lastValueFrom(authService.refreshToken())
            .then((response: RefreshTokenResponse) => {
              authService.setAccessToken(response.accessToken);
              return response.accessToken;
            })
            .catch((refreshError) => {
              console.log('Token refresh failed, logging out');
              authService.logout();
              return null;
            })
            .finally(() => {
              refreshingToken = false;
              refreshTokenPromise = null;
            });
        }

        return from(refreshTokenPromise).pipe(
          switchMap((newAccessToken) => {
            if (newAccessToken) {
              const authReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newAccessToken}` },
              });
              return next(authReq);
            } else {
              return throwError(() => error);
            }
          })
        );
      }

      return throwError(() => error);
    })
  );
};
