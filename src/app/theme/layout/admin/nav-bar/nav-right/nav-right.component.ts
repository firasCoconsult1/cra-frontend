// angular import
import { Component, inject } from '@angular/core';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/demo/pages/authentication/auth-service/authentification.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule,RouterModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent {
  // public props

  // constructor
  constructor(private auth:AuthService, private router:Router , private toastr:ToastrService) {
    const config = inject(NgbDropdownConfig);

    config.placement = 'bottom-right';
  }
  logout(){
    this.auth.logout();
    this.toastr.success('Logout successful', 'Success');
    this.router.navigate(['/auth/signin']);

  }
}
