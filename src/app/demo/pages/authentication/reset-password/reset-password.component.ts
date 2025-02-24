import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth-service/authentification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResetPasswordRequest } from '../model/auth-model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  imports: [RouterModule, CommonModule, FormsModule],
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
  token :string = '';
  successMessage = '';
  resetData: ResetPasswordRequest= {
    
    newPassword: '',
    confirmNewPassword: ''
  };


  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) { }

  ngOnInit() {
    
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.toastr.error('Token manquant', 'Erreur');
        this.router.navigate(['/auth/forgot-password']);
      }
    });
  }

  resetPassword() {
    if (!this.token) {
      this.toastr.error('Token manquant', 'Erreur');
      return;
    }

    if (!this.resetData.newPassword || !this.resetData.confirmNewPassword) {
      this.toastr.error('Veuillez remplir tous les champs', 'Erreur');
      return;
    }

    if (this.resetData.newPassword !== this.resetData.confirmNewPassword) {
      this.toastr.error('Les mots de passe ne correspondent pas', 'Erreur');
      return;
    }

    this.authService.resetPassword(this.token, this.resetData).subscribe({
      next: (response) => {
        this.toastr.success('Password reset successfully', 'Succès');
        this.router.navigate(['/auth/signin']);
      },
      error: (error) => {
        
          this.toastr.error('Password reset failed', 'Erreur');
          
      }
    });
  }

  togglePasswordVisibility(id: string): void {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input.type === 'password') {
      input.type = 'text';
      if (id === 'password') {
        this.passwordVisible = true;
      } else {
        this.confirmPasswordVisible = true;
      }
    } else {
      input.type = 'password';
      if (id === 'password') {
        this.passwordVisible = false;
      } else {
        this.confirmPasswordVisible = false;
      }
    }
  }

}
