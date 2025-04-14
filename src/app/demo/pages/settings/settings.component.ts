import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SettingsService } from './settings-service/settings.service';
import { ChangePasswordRequest } from './model/settings-model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  passwordVisible = false;
  passwordVisible1 = false;
  passwordVisible2 = false;

  changePasswordRequest: ChangePasswordRequest = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''

  }

  constructor(

    private settingService: SettingsService,
    private toastr: ToastrService,
    private router: Router,
    private translate: TranslateService
  ) { }


  changePassword(): void {
    if (this.changePasswordRequest.newPassword !== this.changePasswordRequest.confirmNewPassword) {
      this.toastr.error(
        this.translate.instant('settings.passwords_do_not_match'),
        this.translate.instant('error.title')
      ); return;

    }
    if (this.changePasswordRequest.newPassword.length < 8 || this.changePasswordRequest.confirmNewPassword.length < 8) {
      this.toastr.error(
        this.translate.instant('settings.password_too_short'),
        this.translate.instant('error.title')
      );
      return;
    }

    this.settingService.changePassword(this.changePasswordRequest.oldPassword, this.changePasswordRequest.newPassword, this.changePasswordRequest.confirmNewPassword).subscribe({
      next: (res) => {
        this.toastr.success(
          this.translate.instant('settings.password_changed_successfully'),
          this.translate.instant('success.title')
        ); this.changePasswordRequest.oldPassword = '';
        this.changePasswordRequest.newPassword = '';
        this.changePasswordRequest.confirmNewPassword = '';

      },
      error: () => {
        this.toastr.error(
          this.translate.instant('settings.password_change_failed'),
          this.translate.instant('error.title')
        );
      }
    });
  }
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
  togglePasswordVisibility1(id: string): void {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input.type === 'password') {
      input.type = 'text';
      this.passwordVisible1 = true;
    } else {
      input.type = 'password';
      this.passwordVisible1 = false;
    }

  }
  togglePasswordVisibility2(id: string): void {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input.type === 'password') {
      input.type = 'text';
      this.passwordVisible2 = true;
    } else {
      input.type = 'password';
      this.passwordVisible2 = false;
    }
  }
}

