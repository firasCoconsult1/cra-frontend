import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth-service/authentification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResetPasswordRequest } from '../model/auth-model';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  imports: [RouterModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  email = '';
  errorMessage = '';
  passwordVisible = false;
  confirmPasswordVisible = false;
  newPassword = '';
  confirmNewPassword = '';
  token: string = '';
  successMessage = '';
  resetData: ResetPasswordRequest = {
    newPassword: '',
    confirmNewPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.toastr.error(
          this.translate.instant('reset.tokenMissing'),
          this.translate.instant('error.title')
        );
        this.router.navigate(['/auth/forgot-password']);
      }
    });
  }

  resetPassword() {
    if (!this.token) {
      this.toastr.error(
        this.translate.instant('reset.tokenMissing'),
        this.translate.instant('error.title')
      );
      return;
    }

    if (!this.resetData.newPassword || !this.resetData.confirmNewPassword) {
      this.toastr.error(
        this.translate.instant('reset.fillAllFields'),
        this.translate.instant('error.title')
      );
      return;
    }

    if (this.resetData.newPassword !== this.resetData.confirmNewPassword) {
      this.toastr.error(
        this.translate.instant('reset.passwordsNotMatch'),
        this.translate.instant('error.title')
      );
      return;
    }

    this.authService.resetPassword(this.token, this.resetData).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('reset.success'),
          this.translate.instant('success.title')
        );
        this.router.navigate(['/auth/signin']);
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('reset.failed'),
          this.translate.instant('error.title')
        );
      }
    });
  }

  togglePasswordVisibility(id: string): void {
    const input = document.getElementById(id) as HTMLInputElement;
    const isPassword = input.type === 'password';

    input.type = isPassword ? 'text' : 'password';

    if (id === 'password') {
      this.passwordVisible = isPassword;
    } else {
      this.confirmPasswordVisible = isPassword;
    }
  }
}
