import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegisterRequest } from '../model/auth-model';
import { AuthService } from '../auth-service/authentification.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';







@Component({
  selector: 'app-auth-signup',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export default class AuthSignupComponent {

  passwordVisible = false;
  confirmPasswordVisible = false;
  registerData: RegisterRequest = {
    username: '',
    password: '',

    fullname: ''
  };
  errorMessage = '';
  constructor(private translate: TranslateService,
    private authService: AuthService, private router: Router, private toastr: ToastrService) { }

    register() {
      if (this.registerData.password !== this.registerData.confirmPassword) {
        this.toastr.error(
          this.translate.instant('register.passwordsDoNotMatch'),
          this.translate.instant('register.error')
        );
        return;
      }
    
      if (this.registerData.password.length < 8) {
        this.toastr.error(
          this.translate.instant('register.passwordTooShort'),
          this.translate.instant('register.error')
        );
        return;
      }
    
      this.authService.register(this.registerData).subscribe(
        response => {
          this.toastr.success(
            this.translate.instant('register.success'),
            this.translate.instant('register.successTitle')
          );
          this.resetForm();
          this.router.navigate(['/auth/signin']);
        },
        error => {
          this.toastr.error(
            this.translate.instant('register.failed'),
            this.translate.instant('register.error')
          );
          console.error('Registration failed', error);
        }
      );
    }
    
  resetForm() {
    this.registerData = {
      username: '',
      password: '',
      confirmPassword: '',
      fullname: ''
    };
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
