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
import { AbsenceService } from '../absences-management/services/absence-service.service';
import { Absence } from '../absences-management/model/absence';
import { TranslateService } from '@ngx-translate/core';
import { NgbTimepickerI18nDefault } from '@ng-bootstrap/ng-bootstrap/timepicker/timepicker-i18n';






@Component({
  selector: 'app-cra',
  imports: [CommonModule, TabsModule, TooltipModule, TranslateModule, ButtonModule, ToolbarModule, ToastModule, DatePickerModule, FormsModule, TableModule, TagModule, PaginatorModule],
  providers: [MessageService, ConfirmationService, TranslateService],

  templateUrl: './cra.component.html',
  styleUrl: './cra.component.scss',
  standalone: true,




})
export class CraComponent implements OnInit {
  ngOnInit(): void {
    this.getCrasByConnectedUser();
    this.getAllSendedCras();
    this.getAllAbsences();
    this.getAbsencesByConnectedUser();
  }
  showDatepicker: boolean = false;
  selectedDate: Date | null = null;
  cras: Cra[] = [];
  absences: Absence[] = [];
  selectedCra: Cra | null = null;
  selectedAbsence: Absence | null = null;

  selectedCraToValidate: Cra | null = null;
  listAbsences: Absence[] = [];
  selectedAbsenceToValidate: Absence | null = null;
  validationList: Cra[] = [];
  activeTabIndex: number = 0;


  constructor(private router: Router, private craService: CrasService, private absenceService: AbsenceService, private translate: TranslateService) { }

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
  getAbsencesByConnectedUser() {
    this.absenceService.getAbsencesByConnectedUser(0, 10).subscribe(
      (response) => {
        this.absences = response.content;
      },
      (error) => {
        console.error('Error fetching CRAs:', error);
      }
    );
  }
  getAllSendedCras() {
    this.craService.getAllCra(0, 10).subscribe(
      (response) => {
        this.validationList = response.content.filter(cra => cra.send === true);
      },
      (error) => {
        console.error('Error fetching CRAs:', error);
      }
    );
  }
  getAllAbsences() {
    this.absenceService.getAllAbsences(0, 10).subscribe(
      (result) => {
        this.listAbsences = result.content;
        console.log(this.listAbsences);
      },
      (error) => {
        console.error('Error fetching Absences:', error);
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
        validationMode: false
      }
    });
  }
  goToMyAbsenceDetail(absence: Absence): void {
    const absenceId = absence.idAbsence; 
    if (!absenceId) return;

    this.router.navigate(['/absence'], {
      queryParams: {
        year: absence.year,
        month: absence.month,
        absenceId: absence.idAbsence,
        validationMode: false
      }
    });
  }
  goToValidationCraDetail(cra: Cra): void {
    const craId = cra.idCra;
    if (!craId) return;

    this.router.navigate(['/mes-cras'], {
      queryParams: {
        year: cra.year,
        month: cra.month,
        craId: craId,
        validationMode: true
      }
    });
  }
  goToValidationAbsenceDetail(absence: Absence): void {
    console.log('Clicking absence:', absence);
    const absenceId = absence.idAbsence;
    if (!absenceId) {
      console.error('No absence ID found!');
      return;
    }

    console.log('Navigating to absence page with ID:', absenceId);
    this.router.navigate(['/absence'], {
      queryParams: {
        year: absence.year,
        month: absence.month,
        absenceId: absence.idAbsence,
        validationMode: true
      }
    });
  }
  getMonthName(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString(this.translate.currentLang || 'en-US', { month: 'long' });
  }
}
