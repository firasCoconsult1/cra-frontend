import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { AuthService } from '../authentication/auth-service/authentification.service';
import { User } from '../profile/model/user';
import { ProfileService } from './profile/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TextareaModule } from 'primeng/textarea';
import { IconFieldModule } from 'primeng/iconfield';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    TranslateModule,
    TooltipModule,
    CommonModule,
    FormsModule,
    TextareaModule,
    ReactiveFormsModule,
    IconFieldModule,
    ButtonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  initialUserState: User | null = null;
  profileImage: string | ArrayBuffer | null = null;
  imageFile: File | null = null;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(
      (currentUser: User) => {
        this.profileService.getUserByUsername(currentUser.username).subscribe(
          (user: User) => {
            this.user = user;
            this.initialUserState = { ...user };
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

  getInitials(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  onSave() {
    if (this.user && this.user.id) {
      if (this.imageFile) {
        this.user.imageUrl = this.profileImage as string;
      }
      this.profileService.updateUser(this.user.id, this.user).subscribe({
        next: (updatedUser: User) => {
          this.toastr.success(
            this.translate.instant('profile.userUpdated'),
            this.translate.instant('success.title')
          );
          this.initialUserState = { ...updatedUser };
        },
        error: (error) => {
          this.toastr.error(
            this.translate.instant('profile.updateError'),
            this.translate.instant('error.title')
          );
        },
      });
    } else {
      console.error('User ID is missing');
    }
  }

  onCancel(): void {
    if (this.initialUserState) {
      this.user = { ...this.initialUserState };
      this.profileImage = this.user.imageUrl;
      this.imageFile = null;
    }
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.user?.id) {
      this.profileService.uploadImage(this.user.id, file).subscribe({
        next: (response) => {
          this.toastr.success(
            this.translate.instant('profile.imageUploaded'),
            this.translate.instant('success.title')
          );
          this.user!.imageUrl = response.imageUrl;
        },
        error: (error) => {
          this.toastr.error(
            this.translate.instant('profile.imageUploadError'),
            this.translate.instant('error.title')
          );
          console.error('Error uploading image', error);
        }
      });
    }
  }

  deleteImage(userId: number, fileUrl: string): void {
    const fileName = fileUrl.split('/').pop();
    if (!fileName) {
      console.error('Invalid file URL');
      return;
    }

    this.profileService.deleteUserImage(userId, fileName).subscribe({
      next: (response) => {
        console.log('Image deleted successfully', response);
        this.toastr.success(
          this.translate.instant('profile.imageDeleted'),
          this.translate.instant('success.title')
        );
        this.ngOnInit();
      },
      error: (error) => {
        this.toastr.error(
          this.translate.instant('profile.imageDeleteError'),
          this.translate.instant('error.title')
        );
        console.error('Error deleting image', error);
      }
    });
  }
}
