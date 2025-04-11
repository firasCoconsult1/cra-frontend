import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'signin',
        loadComponent: () => import('./auth-signin/auth-signin.component')
      },
      {
        path: 'signup',
        loadComponent: () => import('./auth-signup/auth-signup.component')
      },
      {
        path : 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password.component').then((c) => c.ForgotPasswordComponent)
      },
      {
        path : 'reset-password',
        loadComponent: () => import('./reset-password/reset-password.component').then((c) => c.ResetPasswordComponent)

      },
      {
        path: 'activation',
        loadComponent: () => import('./auth-activation/auth-activation.component').then((c) => c.AuthActivationComponent)
      },
      {
        path: 'create-account',
        loadComponent: () => import('./create-user-account/create-user-account.component').then((c) => c.CreateUserAccountComponent)
      }
     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
