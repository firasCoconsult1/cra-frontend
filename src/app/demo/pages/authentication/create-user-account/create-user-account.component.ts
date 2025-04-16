import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateAccountRequest } from '../model/auth-model';
import { AuthService } from '../auth-service/authentification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; 


@Component({
  selector: 'app-create-user-account',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-user-account.component.html',
  styleUrl: './create-user-account.component.scss'
})
export class CreateUserAccountComponent {
  email = '';
  errorMessage = '';
  passwordVisible = false;
  confirmPasswordVisible = false;
  newPassword = '';
  confirmNewPassword = '';
  token: string = '';
  successMessage = '';
  data: CreateAccountRequest = {
    username: '',
    password: '',
    confirmPassword: ''
  };


  constructor( private translate: TranslateService,
    private authService: AuthService, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (this.token) {
      this.authService.getEmailFromToken(this.token).subscribe(username => {
        this.data.username = username; 
      });
    }
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



  onSubmit(): void {
    if (this.data.password !== this.data.confirmPassword) {
      this.toastr.error(
        this.translate.instant('create.passwordsDoNotMatch'),
        this.translate.instant('create.errorTitle')
      );
      return;
    }
  
    if (this.data.password.length < 8) {
      this.toastr.error(
        this.translate.instant('create.passwordTooShort'),
        this.translate.instant('create.errorTitle')
      );
      return;
    }
  
    this.authService.createAccount(
      this.data.username, 
      this.data.password, 
      this.data.confirmPassword,
      this.token
    ).subscribe({
      next: () => {
        this.errorMessage = '';
        this.toastr.success(
          this.translate.instant('create.success'),
          this.translate.instant('create.successTitle')
        );
        this.router.navigate(['/auth/signin']);
      },
      error: (error) => {
        this.errorMessage = error.error.message || this.translate.instant('create.userExists');
        this.successMessage = '';
        this.toastr.error(
          this.errorMessage,
          this.translate.instant('create.errorTitle')
        );
      }
    });
  }
  
}


