import { Component, OnInit } from '@angular/core';
import { AuthService } from '../authentication/auth-service/authentification.service';
import { User } from '../profile/model/user';
import { ProfileService } from './profile/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditMode: boolean = false;

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  constructor(private authService: AuthService, private profileService: ProfileService, private toastr:ToastrService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(
      (currentUser: User) => {
        this.profileService.getUserByUsername(currentUser.username).subscribe(
          (user: User) => {
            this.user = user;
            console.log('User data', user);
          },
          (error) => {
            console.error('Error fetching user data', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching current user data', error);
      }
    );
  }

  getInitials(fullName: string): string {
    return fullName.charAt(0).toUpperCase();
  }
  onSave() {
    if (this.user && this.user.id) {
      this.profileService.updateUser(this.user.id, this.user).subscribe({
        next: (updatedUser: User) => {
          this.toastr.success('User updated successfully', 'Success');
          this.toggleEditMode(); 
        },
        error: (error) => {
          this.toastr.error('Error updating user', 'Error');
        },
      });
    } else {
      console.error('User ID is missing');
    }
  }
}