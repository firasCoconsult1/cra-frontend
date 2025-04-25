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
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [
    RouterLink,
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
    // Vérification des champs vides
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = this.translate.instant('FILL_IN_FIELDS');
      return;
    }
  
    // Vérification de l'existence de l'utilisateur par son nom d'utilisateur
    this.authService.getByUsername(this.loginData.username).subscribe({
      next: (user) => {
        // Si l'utilisateur est désactivé
        if (!user.enabled) {
          this.toast.error(this.translate.instant('ACCOUNT_DISABLED'), this.translate.instant('error.title'));
          return;
        }
  
        // Tentative de connexion
        this.authService.login({ username: this.loginData.username, password: this.loginData.password }).subscribe({
          next: (res) => {
            // Enregistrement des tokens et redirection
            this.authService.setToken(res.accessToken, res.refreshToken);
            this.toast.success(this.translate.instant('LOGIN_SUCCESS'), this.translate.instant('success.title'));
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            // Gestion des erreurs de connexion
            console.log('Erreur de connexion:', err);
            if (err.message === 'Invalid credentials') {
              this.errorMessage = this.translate.instant('INVALID_CREDENTIALS');
            } else {
              this.errorMessage = this.translate.instant('LOGIN_FAILED');
            }
            this.toast.error(this.errorMessage, this.translate.instant('error.title'));
          }
        });
      },
      error: (err) => {
        // Si l'utilisateur n'est pas trouvé (erreur 404)
        console.log('Erreur de récupération de l\'utilisateur:', err);
        if (err.message === 'Invalid credentials') {
          this.errorMessage = this.translate.instant('INVALID_CREDENTIALS');
        } else {
          this.errorMessage = this.translate.instant('ACCOUNT_VERIFICATION_FAILED');
        }
        this.toast.error(this.errorMessage, this.translate.instant('error.title'));
      }
    });
  }
  


}

