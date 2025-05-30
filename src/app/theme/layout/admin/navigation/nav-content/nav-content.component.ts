// angular import
import { Component, inject, output } from '@angular/core';
import { Location } from '@angular/common';

// project import
import { environment } from 'src/environments/environment';
import { NavigationItem, NavigationItems } from '../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavGroupComponent } from './nav-group/nav-group.component';
import { RoleServiceService } from 'src/app/demo/pages/role-management/role/role-service.service';

@Component({
  selector: 'app-nav-content',
  imports: [SharedModule, NavGroupComponent],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent {
  private location = inject(Location);


  // public method
  // version
  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  navigations!: NavigationItem[];
  wrapperWidth: number;
  windowWidth = window.innerWidth;

  NavCollapsedMob = output();
    ngOnInit(): void {
    this.roleService.loadCurrentUserPermissions();
    this.roleService.permissionsLoaded$.subscribe(loaded => {
      if (loaded) {
        this.navigations = this.filterNavigationItems(NavigationItems);
      }
    });
  }

  // constructor
  constructor(public roleService: RoleServiceService) {
    this.navigations = this.filterNavigationItems(NavigationItems);

  }

   filterNavigationItems(items: NavigationItem[]): NavigationItem[] {
    return items
      .filter(item => {
        if (!item.permission) return true;
        if (Array.isArray(item.permission)) {
          // Affiche si l'utilisateur a AU MOINS UNE des permissions
          return item.permission.some(p => this.roleService.hasPermission(p));
          // Pour exiger TOUTES les permissions, utilise .every() à la place de .some()
        }
        return this.roleService.hasPermission(item.permission);
      })
      .map(item => ({
        ...item,
        children: item.children ? this.filterNavigationItems(item.children) : undefined
      }));
  }

  fireOutClick() {
    let current_url = this.location.path();
    if (this.location['_baseHref']) {
      current_url = this.location['_baseHref'] + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent.parentElement.parentElement;
      const last_parent = up_parent.parentElement;
      if (parent.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('pcoded-trigger');
        parent.classList.add('active');
      } else if (up_parent.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('pcoded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('pcoded-trigger');
        last_parent.classList.add('active');
      }
    }
  }
}
