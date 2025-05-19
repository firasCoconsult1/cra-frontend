import { Component, OnInit } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../authentication/auth-service/authentification.service';
import { User } from '../profile/model/user';
import { ProfileService } from '../profile/profile/profile.service';
import { AbsenceService } from './services/absence-service.service';
import { Absence, AbsenceStatus } from './model/absence';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DayAbsence, MonthAbsenceSummary } from './model/dayAbsence';
import { ActivatedRoute } from '@angular/router';

export interface MonthBalance {
  month: string;
  balance: number;
}

@Component({
  selector: 'app-absences-management',
  imports: [DatePickerModule, FormsModule, CommonModule, TranslateModule, ButtonModule, DividerModule, ToastModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './absences-management.component.html',
  styleUrl: './absences-management.component.scss'
})
export class AbsencesManagementComponent implements OnInit {
  selectedDate: Date | null = null;
  showDatepicker = false;
  daysOfMonth: { date: Date, dayName: string }[] = [];
  currentUser: User;
  reason: string = '';
  comment: string = '';
  days: DayAbsence[] = [];
  selectedMonth: string = '';
  selectedYear: string = '';
  isValidationMode: boolean = false;
  absence: Absence | null = null;
  monthBalances: MonthBalance[] = [];
  absenceUser: User | null = null;
  monthAbsences: MonthAbsenceSummary[] = [];
  totalDays = 0;



  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private profileService: ProfileService,
    private absenceService: AbsenceService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
    this.route.queryParams.subscribe(params => {
      const absenceId = params['absenceId'];
      this.isValidationMode = params['validationMode'] === 'true';
      if (absenceId) {
        this.loadAbsence(absenceId);
      }
    });
    if (this.days?.length) {
      this.onDayValueChange();
    }

  }
  loadMonthlyAbsenceSummary() {
    if (!this.currentUser) return;

    this.absenceService.getMonthlyAbsenceSummary(this.currentUser.id).subscribe({
      next: (data) => {
        const now = new Date();
        const registrationDate = new Date(this.currentUser.dateSignUp);

        const fullMonths = this.generateFullMonthList(registrationDate, now);

        for (const fullMonth of fullMonths) {
          const found = data.find(mb => mb.month === fullMonth.month);
          if (found) {
            fullMonth.daysTaken = found.daysTaken;
          }
        }

        this.monthAbsences = fullMonths;
      },
      error: (err) => {
        console.error('Erreur chargement résumé absences mensuelles', err);
      }
    });
  }
  getMonthNameFromString(monthStr: string): string {
    if (!monthStr) return 'Date invalide';
    const parts = monthStr.split('-');
    if (parts.length !== 2) return 'Date invalide';

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);

    return this.getMonthName(year, month);
  }



  generateFullMonthList(startDate: Date, endDate: Date): MonthAbsenceSummary[] {
    const months: MonthAbsenceSummary[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= end) {
      const monthStr = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
      months.push({
        month: monthStr,
        year: current.getFullYear(),
        daysTaken: 0
      });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }



  getCurrentUser() {
    this.authService.getCurrentUser().subscribe(
      (currentUser: User) => {
        this.profileService.getUserByUsername(currentUser.username).subscribe(
          (user: User) => {
            this.currentUser = user;
            if (!this.isValidationMode) {
              this.loadMonthlyAbsenceSummary();

            }
          },
          (error) => console.error('Erreur récupération utilisateur', error)
        );
      },
      (error) => console.error('Erreur récupération current user', error)
    );
  }

  onDateSelected() {
    if (this.selectedDate) {
      this.showDatepicker = true;
      this.generateDaysOfMonth(this.selectedDate);
    }
  }

  generateDaysOfMonth(date: Date) {
    this.daysOfMonth = [];
    this.days = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day, 12);
      const dayName = currentDate.toLocaleDateString('fr-FR', { weekday: 'long' });
      this.daysOfMonth.push({ date: currentDate, dayName });
      this.days.push({ id: undefined, date: currentDate, value: null });
    }
  }

  getDayLetter(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const dayName = date.toLocaleDateString(this.translate.currentLang || 'en-US', { weekday: 'long' });
    return dayName.slice(0, 3).charAt(0).toUpperCase() + dayName.slice(1, 3);
  }

  cancel() {
    this.showDatepicker = false;
    this.selectedDate = null;
  }

  getMonthName(year: number, month: number): string {
    const date = new Date(year, month - 1, 1); // month - 1 car JavaScript commence les mois à 0
    return date.toLocaleString(this.translate.currentLang || 'en-US', { month: 'long', year: 'numeric' });
  }



  sendAbsenceRequest() {
    if (!this.selectedDate || !this.currentUser) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Erreur',
        detail: 'Veuillez sélectionner un mois et être connecté.'
      });
      return;
    }
    const isNewAbsence = !this.absence?.idAbsence;


    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;

    const days: DayAbsence[] = this.days.filter(day => day.value && day.value !== 0);

    const absence: Absence = {
      idAbsence: undefined,
      year,
      month,
      reason: this.reason || '',
      comment: this.comment || '',
      isSend: false,
      days,
      status: AbsenceStatus.IN_PROGRESS
    };

    const saveSuccess = (savedAbsence: Absence) => {
      this.absence = savedAbsence;
      this.reason = savedAbsence.reason || '';
      this.comment = savedAbsence.comment || '';



      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success.title'),
        detail: this.translate.instant(isNewAbsence ? 'absence_created_successfully' : 'absence_updated_successfully'),
      });
    };

    if (this.absence?.idAbsence) {
      this.absenceService.updateAbsence(this.absence.idAbsence, absence).subscribe({
        next: saveSuccess,
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('error.title'),
            detail: this.translate.instant('error.updating_cra'),
          });
        }
      });
    } else {
      this.absenceService.createAbsence(absence).subscribe({
        next: saveSuccess,
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('error.title'),
            detail: this.translate.instant('absence_not_created'),
          });
        }
      });
    }
  }

  loadAbsence(absenceId: number): void {
    this.absenceService.getAbsenceById(absenceId).subscribe({
      next: (absence: Absence) => {
        this.absence = absence;
        this.selectedDate = new Date(absence.year, absence.month - 1, 1);
        this.reason = absence.reason || '';
        this.comment = absence.comment || '';
        this.generateDaysOfMonth(this.selectedDate);

        for (let i = 0; i < this.days.length; i++) {
          const found = absence.days.find(d =>
            new Date(d.date).toDateString() === new Date(this.days[i].date).toDateString()
          );
          this.days[i].value = found ? found.value : 0;
          this.days[i].id = found ? found.id : undefined;
        }
        this.onDayValueChange();

        if (this.isValidationMode && absence.userId) {
          this.profileService.getUserById(absence.userId).subscribe(user => {
            this.absenceUser = user;
          });
        }

        this.showDatepicker = true;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('error.loading_absence'),
        });
      }
    });
  }

  rejectAbsence(): void {
    if (!this.absence?.idAbsence) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('error.title'),
        detail: this.translate.instant('cra_not_found'),
      });
      return;
    }
    if (this.comment || this.absence.reason) {
      const absenceToUpdate = {
        ...this.absence,
        comment: this.comment || this.absence.comment || '',
        reason: this.absence.reason || '',
      };

      this.absenceService.updateAbsence(this.absence.idAbsence, absenceToUpdate).subscribe({
        next: (updatedAbsence) => {
          this.absence = updatedAbsence;



          this.absenceService.rejectAbsence(this.absence.idAbsence).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('success.title'),
                detail: this.translate.instant('absence_rejected_successfully'),
              });
              if (this.absence) {
                this.absence.status = AbsenceStatus.REJETE;
                this.totalDays = 0;
              }
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('error.title'),
                detail: this.translate.instant('error.rejecting_absence'),
              });
            }
          });
        }
      });
    }
    else {
      this.absenceService.rejectAbsence(this.absence.idAbsence).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('success.title'),
            detail: this.translate.instant('absence_rejected_successfully'),
          });
          if (this.absence) {
            this.absence.status = AbsenceStatus.REJETE;
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('error.title'),
            detail: this.translate.instant('error.rejecting_absence'),
          });
        }
      });
    }
  }
  validateAbsence(): void {
    if (!this.absence?.idAbsence) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('error.title'),
        detail: this.translate.instant('absence_not_found'),
      });
      return;
    }

    if (this.comment || this.absence.reason) {
      const absenceToUpdate = {
        ...this.absence,
        comment: this.comment || this.absence.comment || '',
        reason: this.absence.reason || '',
      };

      this.absenceService.updateAbsence(this.absence.idAbsence, absenceToUpdate).subscribe({
        next: (updatedAbsence) => {
          this.absence = updatedAbsence;

          this.absenceService.validateAbsence(this.absence.idAbsence).subscribe({
            next: (updatedUser) => {
              console.log('Updated user leave balance:', updatedUser.leaveBalance); // Log for debugging
              this.loadMonthlyAbsenceSummary();
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('success.title'),
                detail: this.translate.instant('absence_validated_successfully'),
              });

              if (this.absence) {
                this.absence.status = AbsenceStatus.VALIDE;
              }
              this.totalDays = 0;
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('error.title'),
                detail: this.translate.instant('error.validating_absence'),
              });
            },
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('error.title'),
            detail: this.translate.instant('error.updating_comments'),
          });
        },
      });
    } else {
      this.absenceService.validateAbsence(this.absence.idAbsence).subscribe({
        next: (updatedUser) => {
          console.log('Updated user leave balance:', updatedUser.leaveBalance); // Log for debugging
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('success.title'),
            detail: this.translate.instant('absence_validated_successfully'),
          });

          this.currentUser.leaveBalance = updatedUser.leaveBalance; // Update leave balance

          if (this.absence) {
            this.absence.status = AbsenceStatus.VALIDE;
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('error.title'),
            detail: this.translate.instant('error.validating_absence'),
          });
        },
      });
    }
  }

  getDisplayedLeaveBalance(): number | null {
    if (this.isValidationMode) {
      return this.absenceUser?.leaveBalance ?? null;
    }
    return this.currentUser?.leaveBalance ?? null;
  }

  getPredictedBalance(): number {
    if (this.isValidationMode && this.absenceUser?.leaveBalance != null) {
      return this.absenceUser?.leaveBalance - this.totalDays;
    }
    return (this.currentUser?.leaveBalance || 0) - this.totalDays;
  }


  onDayValueChange(): void {
    this.totalDays = this.days
      ?.filter(day => !isNaN(day.value) && +day.value > 0)
      .reduce((sum, day) => sum + +day.value, 0) || 0;
  }



}
