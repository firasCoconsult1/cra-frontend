import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { AuthGuard } from './demo/pages/authentication/auth.guard';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/signin',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        //canActivate: [AuthGuard],
      },
      
      {
        path: 'settings',
        loadComponent: () => import('./demo/pages/settings/settings.component').then((c) => c.SettingsComponent),
        //canActivate: [AuthGuard],

      },
      {
        path: 'profile',
        loadComponent: () => import('./demo/pages/profile/profile.component').then((c) => c.ProfileComponent),
       // canActivate: [AuthGuard],

      },
      {
        path:'role',
        loadComponent: () => import('./demo/pages/role-management/role-management.component').then((c) => c.RoleManagementComponent),
      //  canActivate: [AuthGuard],

      },
      {
        path:'resource',
        loadComponent: () => import('./demo/pages/resource-management/resource-management.component').then((c) => c.ResourceManagementComponent),
     //   canActivate: [AuthGuard],

      }
      
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () => import('./demo/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      }
     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}