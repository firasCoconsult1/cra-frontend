import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

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
  
    FormsModule
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
  user:User;



  constructor(private userService : ResourceManagementService, private authService: AuthService, private router: Router, private toast:ToastrService) {}

  

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
    if (!this.loginData.username|| !this.loginData.password) {
      this.errorMessage = 'Please fill in all the fields.';
      return;
    }
 
   
    

    this.authService.login({ username: this.loginData.username, password: this.loginData.password}).subscribe({
      next: (res) => {
        this.authService.setToken(res.accessToken, res.refreshToken);
        this.toast.success('Login successful', 'Success');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
       
        this.toast.error('Login failed', 'Error');
      }
    });
  }
  
}

