import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth-service/authentification.service';
import { LoginRequest } from '../model/auth-model';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../profile/model/user';
import { ResourceManagementService } from '../../resource-management/service/resource-management.service';

@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export default class AuthSigninComponent {
  passwordVisible = false;
  loginData: LoginRequest = {
    username: '',
    password: ''
  };
  errorMessage = '';
  user: User;



  constructor(private translate: TranslateService,private userService: ResourceManagementService, private authService: AuthService, private router: Router, private toast: ToastrService) { }



  togglePasswordVisibility(id: string): void {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input.type === 'password') {
      input.type = 'text';
      this.passwordVisible = true;
    } else {
      input.type = 'password';
      this.passwordVisible = false;
    }
  }

  login(): void {
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = this.translate.instant('FILL_IN_FIELDS');
      return;
    }

    this.authService.getByUsername(this.loginData.username).subscribe({
      next: (user) => {
        if (!user.enabled) {
          this.toast.error(this.translate.instant('ACCOUNT_DISABLED'), this.translate.instant('error.title'));
          return;
        }

        this.authService.login({ username: this.loginData.username, password: this.loginData.password }).subscribe({
          next: (res) => {
            this.authService.setToken(res.accessToken, res.refreshToken);
            this.toast.success(this.translate.instant('LOGIN_SUCCESS'), this.translate.instant('success.title'));
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.toast.error(this.translate.instant('LOGIN_FAILED'), this.translate.instant('error.title'));
          }
        });
      },
      error: () => {
        this.toast.error(this.translate.instant('ACCOUNT_VERIFICATION_FAILED'),  this.translate.instant('error.title'));
      }
    });
  }


}

