// angular import
import { Component, inject } from '@angular/core';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/demo/pages/authentication/auth-service/authentification.service';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from 'src/app/demo/pages/profile/profile/profile.service';
import { User } from 'src/app/demo/pages/profile/model/user';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent {
  // public props
  user: User | null = null;
  // constructor
  constructor(private auth: AuthService, private router: Router, private toastr: ToastrService, private authService: AuthService, private profileService: ProfileService) {
    const config = inject(NgbDropdownConfig);

    config.placement = 'bottom-right';
  }
  logout() {
    this.auth.logout();
    this.toastr.success('Logout successful', 'Success');
    this.router.navigate(['/auth/signin']);

  }



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
  
}

