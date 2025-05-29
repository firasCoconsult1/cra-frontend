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
import { DropdownModule } from 'primeng/dropdown';

import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';

import { TranslateService } from '@ngx-translate/core';
import { FactureService } from '../facture-management/Facture-service/facture.service';
import { Facture, FactureStatus } from '../facture-management/model/facture';
import { User } from '../profile/model/user';
import { ProfileService } from '../profile/profile/profile.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-factures',
  imports: [DropdownModule, TabsModule, TooltipModule, TranslateModule, ButtonModule, ToolbarModule, ToastModule, DatePickerModule, FormsModule, TableModule, TagModule, PaginatorModule, CommonModule, InputTextModule],
  providers: [MessageService, ConfirmationService, TranslateService],
  templateUrl: './factures.component.html',
  styleUrl: './factures.component.scss'
})
export class FacturesComponent implements OnInit {
  factures: Facture[] = [];
  selectedFacture: Facture | null = null;
  userId: number;
  searchTerm: string = '';
  driveSearchTerm: string = '';
  driveSearchResults: any[] = [];
  driveSearchDone: boolean = false;
  searchMode: 'drive' | 'user' = 'drive';
 


  userMap: { [userId: number]: User } = {};
  constructor(private messageService: MessageService, private router: Router, private factureService: FactureService, private translate: TranslateService, private profileService: ProfileService) { }
  ngOnInit(): void {
    this.getFactures();
 

  }
  

  


  getFactures() {
    this.factureService.getFactures(0, 10).subscribe({
      next: (res) => {
        this.factures = res.content;

        const userIds = Array.from(new Set(this.factures.map(f => f.userId).filter(id => id != null)));

        if (userIds.length > 0) {
          const userRequests = userIds.map(id => this.profileService.getUserById(id));

          forkJoin(userRequests).subscribe(users => {
            users.forEach(user => {
              this.userMap[user.id] = user;
            });

            console.log('userMap loaded:', this.userMap);
          });
        }
      },
      error: (err) => {
        console.error('Erreur chargement factures', err);
      }
    });
  }

  getUsername(userId: number): string {
    return this.userMap[userId]?.fullname || '—';
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
        validationMode: true,
        month: facture.month,
        year: facture.year,
        status: facture.status
      }
    });
  }
  searchFactures(): void {
    if (!this.searchTerm.trim()) {
      this.getFactures();
      return;
    }

    this.factureService.searchFactures(this.searchTerm).subscribe({
      next: (data) => {
        const facturesResult = data.content ? data.content : data;
        this.factures = facturesResult;

        this.userMap = {};


        const userIds = Array.from(new Set(
          this.factures
            .map(f => f.userId)
            .filter(id => id != null)
        ));

        if (userIds.length > 0) {
          const userRequests = userIds.map(id => this.profileService.getUserById(id));

          forkJoin(userRequests).subscribe({
            next: (users) => {
              users.forEach(user => {
                this.userMap[user.id] = user;
                console.log('User', user);
              });


              this.messageService.add({
                severity: 'info',
                summary: this.translate.instant('search_results'),
                detail: this.translate.instant('found_factures', { count: facturesResult.length })
              });
            },
            error: (err) => {
              console.error('Erreur lors de la récupération des utilisateurs', err);
              this.messageService.add({
                severity: 'info',
                summary: this.translate.instant('search_results'),
                detail: this.translate.instant('found_factures', { count: facturesResult.length })
              });
            }
          });
        } else {
          this.messageService.add({
            severity: 'info',
            summary: this.translate.instant('search_results'),
            detail: this.translate.instant('found_factures', { count: facturesResult.length })
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors de la recherche de factures', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('search_failed')
        });
      }
    });
  }

  searchDriveFactures() {
    if (!this.driveSearchTerm?.trim()) {
      return;
    }

    const facturesFolderId = '124OH-sDQ6aHUSP2BzaJtltSgbfJR43ug'; 
    const searchQuery = `${this.driveSearchTerm} parent:${facturesFolderId}`;
    const url = `https://drive.google.com/drive/search?q=${encodeURIComponent(searchQuery)}`;

    window.open(url, '_blank');
  }


}
