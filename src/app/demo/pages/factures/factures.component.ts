import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';

import { TranslateService } from '@ngx-translate/core';
import { FactureService } from '../facture-management/Facture-service/facture.service';
import { Facture, FactureStatus } from '../facture-management/model/facture';
import { User } from '../profile/model/user';
import { ProfileService } from '../profile/profile/profile.service';
import { ResourceManagementService } from '../resource-management/service/resource-management.service';


@Component({
  selector: 'app-factures',
  imports: [TabsModule, TooltipModule, TranslateModule, ButtonModule, ToolbarModule, ToastModule, DatePickerModule, FormsModule, TableModule, TagModule, PaginatorModule, CommonModule, InputTextModule],
  providers: [MessageService, ConfirmationService, TranslateService],
  templateUrl: './factures.component.html',
  styleUrl: './factures.component.scss'
})
export class FacturesComponent implements OnInit {
  factures: Facture[] = [];
  selectedFacture: Facture | null = null;
  userId: number;
  searchTerm: string = '';

  userMap: { [userId: number]: User } = {};
  constructor(private messageService: MessageService, private router: Router, private factureService: FactureService, private translate: TranslateService, private profileService: ProfileService) { }
  ngOnInit(): void {
    this.getFactures();

  }

  getFactures() {
    this.factureService.getFactures(0, 10).subscribe({
      next: (res) => {
        this.factures = res.content;
        this.factures.forEach(facture => {
          if (facture.userId && !this.userMap[facture.userId]) {
            this.profileService.getUserById(facture.userId).subscribe({
              next: (user) => {
                this.userMap[facture.userId] = user;
              }
            });
          }
        });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getMonthName(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString(this.translate.currentLang || 'en-US', { month: 'long' });
  }
  getSeverity(status: FactureStatus) {
    switch (status) {
      case 'PAYE':
        return 'success';
      case 'NON_PAYE':
        return 'danger';
      default:
        return 'warn';
    }
  }


  goToFactureDetailForDownload(facture: Facture): void {
    console.log('Going to facture detail for download:', facture);
    const idFacture = facture.idFacture;
    if (!idFacture) {
      console.error('No facture ID found!');
      return;
    }

    console.log('Navigating to facture page with ID:', idFacture);
    this.router.navigate(['/facture'], {
      queryParams: {
        factureId: facture.idFacture,
        craId: facture.craId,
        validationMode: true,
        downloadMode: true
      }
    });
  }

  goToValidationFactureDetail(facture: Facture): void {
    console.log('Going to facture detail:', facture);
    const idFacture = facture.idFacture;
    if (!idFacture) {
      console.error('No facture ID found!');
      return;
    }

    console.log('Navigating to facture page with ID:', idFacture);
    this.router.navigate(['/facture'], {
      queryParams: {
        factureId: facture.idFacture,
        craId: facture.craId,
        validationMode: true
      }
    });
  }
  searchFactures(): void {
    if (!this.searchTerm.trim()) {
      this.getFactures();
      return;
    }

    this.factureService.searchFactures(this.searchTerm).subscribe(
      data => {
        this.factures = data.content ? data.content : data;
        this.factures.forEach(facture => {
          if (facture.userId && !this.userMap[facture.userId]) {
            this.profileService.getUserById(facture.userId).subscribe({
              next: (user) => {
                this.userMap[facture.userId] = user;
              }
            });
          }
        });

        this.messageService.add({
          severity: 'info',
          summary: this.translate.instant('search_results'),
          detail: this.translate.instant('found_factures', { count: data.length })
        });
      },
      error => {
        console.error('Error searching factures', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('search_failed')
        });
      }
    );
  }

}
