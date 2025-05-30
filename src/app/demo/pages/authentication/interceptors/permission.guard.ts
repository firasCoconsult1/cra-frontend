import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { RoleServiceService } from '../../role-management/role/role-service.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(private permissionService: RoleServiceService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredPermission = route.data['permission'];
    if (this.permissionService.hasPermission(requiredPermission)) {
      return true;
    }
    // Rediriger si l'utilisateur n'a pas la permission
    this.router.navigate(['/unauthorized']);
    return false;
  }
}