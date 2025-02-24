import { Component } from '@angular/core';
import { AuthService } from '../auth-service/authentification.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-forgot-password',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  username = '';
  errorMessage = '';
  successMessage = '';
  

  constructor(private authService: AuthService, private router: Router, private toastr:ToastrService) { }

  requestPasswordReset() {
    this.authService.requestPasswordReset(this.username).subscribe(
      
      response => {
        this.toastr.success('Password reset request sent', 'Success');
        this.router.navigate(['/auth/reset-password']);
      },
      error => {
        this.toastr.error('Password reset request failed', 'Error');
        console.error('Password reset request failed', error);
      }
    );
  }
  

}
