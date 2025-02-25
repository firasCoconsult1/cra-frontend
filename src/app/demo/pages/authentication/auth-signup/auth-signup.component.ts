import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegisterRequest } from '../model/auth-model';
import { AuthService } from '../auth-service/authentification.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';







@Component({
  selector: 'app-auth-signup',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
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
  constructor(private authService: AuthService, private router: Router, private toastr:ToastrService ) {}

  register() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.toastr.error('Passwords do not match', 'Error');
      return;
      
    }
    if (this.registerData.password.length<8){
      this.toastr.error('Password is short','Error');
      return;
    }
    
  

    this.authService.register(this.registerData).subscribe(
      response => {
        this.toastr.success('Registration successful', 'Success');
        this.resetForm();
        
        
      },
      error => {
        this.errorMessage = 'Registration failed';
        this.toastr.error(this.errorMessage, 'Error');
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
