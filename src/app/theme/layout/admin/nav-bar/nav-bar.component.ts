// angular import
import { Component, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {  DropdownModule } from 'primeng/dropdown';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavLeftComponent } from './nav-left/nav-left.component';
import { NavRightComponent } from './nav-right/nav-right.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-nav-bar',
  imports: [SharedModule, NavLeftComponent, NavRightComponent, RouterModule, CommonModule, DropdownModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  // public props
  readonly NavCollapsedMob = output();
  navCollapsedMob;
  headerStyle: string;
  menuClass: boolean;
  collapseStyle: string;
 


  // constructor
  constructor(private translate: TranslateService, private router: Router) {
    this.navCollapsedMob = false;
    this.headerStyle = '';
    this.menuClass = false;
    this.collapseStyle = 'none';
    

  }

  // public method
  toggleMobOption() {
    this.menuClass = !this.menuClass;
    this.headerStyle = this.menuClass ? 'none' : '';
    this.collapseStyle = this.menuClass ? 'block' : 'none';
  }

  // this is for eslint rule
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }

  closeMenu() {
    if (document.querySelector('app-navigation.pcoded-navbar').classList.contains('mob-open')) {
      document.querySelector('app-navigation.pcoded-navbar').classList.remove('mob-open');
    }
  }
 
}
