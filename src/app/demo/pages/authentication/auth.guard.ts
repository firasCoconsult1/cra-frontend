import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth-service/authentification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn.pipe(
      map(isLogged => {
        if (isLogged) {
          return true;
        } else {
          return this.router.createUrlTree(['/auth/signin']); 
        }
      })
    );
  }
}
