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
import { Cra, Status } from './model/Cra';
import { CrasService } from './cra-service/cras.service';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';






@Component({
  selector: 'app-cra',
  imports: [CommonModule, TabsModule, TooltipModule, TranslateModule, ButtonModule, ToolbarModule, ToastModule, DatePickerModule, FormsModule, TableModule, TagModule, PaginatorModule],
  providers: [MessageService, ConfirmationService],

  templateUrl: './cra.component.html',
  styleUrl: './cra.component.scss',
  standalone: true,




})
export class CraComponent implements OnInit {
  ngOnInit(): void {
    this.getCrasByConnectedUser();
    this.getAllSendedCras();
  }
  showDatepicker: boolean = false;
  selectedDate: Date | null = null;
  cras: Cra[] = [];
  selectedCra: Cra | null = null;
  selectedCraToValidate: Cra | null = null;

  validationList: Cra[] = [];
  activeTabIndex: number = 0;


  constructor(private router: Router, private craService: CrasService) { }

  onDateSelected() {
    if (this.selectedDate) {
      const year = this.selectedDate.getFullYear();
      const month = this.selectedDate.getMonth() + 1;
      this.showDatepicker = false;
      this.router.navigate(['/mes-cras'], {
        queryParams: { year: year, month: month }
      });
    }
  }
  getCrasByConnectedUser() {
    this.craService.getCraByConnectedUser(0, 10).subscribe(
      (response) => {
        this.cras = response.content;
      },
      (error) => {
        console.error('Error fetching CRAs:', error);
      }
    );
  }
  getAllSendedCras(){
    this.craService.getAllCra(0,10).subscribe(
      (response) => {
        this.validationList = response.content.filter(cra => cra.send === true);
      },
      (error) => {
        console.error('Error fetching CRAs:', error);
      }
    );
  }
  getSeverity(status: Status) {
    switch (status) {
      case 'VALIDE':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'REJETE':
        return 'danger';
      default:
        return 'warn';
    }
  }

  goToMyCraDetail(cra: Cra): void {
    const craId = cra.idCra;
    if (!craId) return;
  
    this.router.navigate(['/mes-cras'], {
      queryParams: { 
        year: cra.year, 
        month: cra.month, 
        craId: craId,
        validationMode: false // Toujours false pour "Mes CRA"
      }
    });
  }
  
  // Pour les CRA à valider (onglet "Validation List")
  goToValidationCraDetail(cra: Cra): void {
    const craId = cra.idCra;
    if (!craId) return;
  
    this.router.navigate(['/mes-cras'], {
      queryParams: { 
        year: cra.year, 
        month: cra.month, 
        craId: craId,
        validationMode: true // Toujours true pour "Validation List"
      }
    });
  }
}
