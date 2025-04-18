// Angular import
import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import {  DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// project import
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [SpinnerComponent, RouterModule, DropdownModule, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  languages = [
    { label: 'English', value: 'en', icon: 'assets/flags/flag_us.png' },
    { label: 'Français', value: 'fr', icon: 'assets/flags/flag_fr.jpg' }
  ];

  selectedLanguage = this.languages[0].value;
  isAuthRoute = false;

  constructor(private translate: TranslateService, private router: Router) {
    this.translate.setDefaultLang(this.selectedLanguage);
  }

  switchLanguage(lang: any) {
    this.translate.use(lang.value);
    localStorage.setItem('lang', lang.value);
  }

  ngOnInit() {
    this.checkRoute(this.router.url);
    
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.checkRoute(evt.urlAfterRedirects);
        window.scrollTo(0, 0);
      }
    });
  }

  private checkRoute(url: string) {
    this.isAuthRoute = url.includes('/auth');
  }
}
