import { Component } from '@angular/core';
import { AuthService } from '../auth-service/authentification.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; 


@Component({
  selector: 'app-forgot-password',
  imports: [RouterModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  username = '';
  errorMessage = '';
  successMessage = '';
  

  constructor(    private translate: TranslateService,
    private authService: AuthService, private router: Router, private toastr:ToastrService) { }

    requestPasswordReset() {
      this.authService.requestPasswordReset(this.username).subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('forgot.success'),
            this.translate.instant('forgot.successTitle')
          );
          this.router.navigate(['/auth/reset-password']);
        },
        error: (error) => {
          this.toastr.error(
            this.translate.instant('forgot.error'),
            this.translate.instant('forgot.errorTitle')
          );
          console.error('Password reset request failed', error);
        }
      });
    }
  

}
