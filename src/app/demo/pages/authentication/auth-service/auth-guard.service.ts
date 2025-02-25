import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { AuthService } from './authentification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isLoggedIn.pipe(
      map(isLoggedIn => {
        //const expectedRoles = next.data['roles'] as string[];
       // const userRoles = this.authService.getUser().roles;

        if (isLoggedIn) {
          // If user is logged in and has the required roles
          return true;
        } else if (isLoggedIn) {
          // If user is logged in but doesn't have the required roles, redirect to home
          this.router.navigate(['/dashboard']);
          return false;
        } else {
          // If user is not logged in, redirect to login
          this.router.navigate(['/auth/signin']);
          return false;
        }
      })
    );
  }
}
