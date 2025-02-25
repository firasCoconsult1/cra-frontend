import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SettingsService } from './settings-service/settings.service';
import { ChangePasswordRequest } from './model/settings-model';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-settings',
  imports: [CommonModule,FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  passwordVisible = false;
  passwordVisible1 = false;
  passwordVisible2 = false;
  
  changePasswordRequest:ChangePasswordRequest = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''

  }

  constructor(
    
    private settingService: SettingsService,
    private toastr: ToastrService,
  ) {}
  

changePassword(): void {
  if (this.changePasswordRequest.newPassword !== this.changePasswordRequest.confirmNewPassword) {
    this.toastr.error('Passwords do not match', 'Error');
    return;
    
  }
  if (this.changePasswordRequest.newPassword.length<8 || this.changePasswordRequest.confirmNewPassword.length<8){
    this.toastr.error('Password is short','Error');
    return;
  }
  this.settingService.changePassword(this.changePasswordRequest.oldPassword,this.changePasswordRequest.newPassword,this.changePasswordRequest.confirmNewPassword).subscribe({
    next: (res) => {
      this.toastr.success('Password changed successfully', 'Success');
      
    },
    error: () => {
      this.toastr.error('Password change failed', 'Error');
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

