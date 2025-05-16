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
import { DayAbsence } from './model/dayAbsence';
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
  }

  getCurrentUser() {
    this.authService.getCurrentUser().subscribe(
      (currentUser: User) => {
        this.profileService.getUserByUsername(currentUser.username).subscribe(
          (user: User) => {
            this.currentUser = user;
            if (!this.isValidationMode) {
              this.generateMonthBalancesForUser(user);
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

  getMonthName(dateStr: string): string {
    const date = new Date(dateStr + '-01');
    return date.toLocaleString(this.translate.currentLang || 'en-US', { month: 'long', year: 'numeric' });
  }

  generateMonthBalancesForUser(user: User): void {
    if (!user?.dateSignUp) return;

    const signUpDate = new Date(user.dateSignUp);
    const startYear = signUpDate.getFullYear();
    const startMonth = signUpDate.getMonth();
    const balances: MonthBalance[] = [];
    let year = startYear;
    let month = startMonth;
    let balance = 0;

    const today = new Date();
    const endYear = today.getFullYear();
    const endMonth = today.getMonth();
    const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

    for (let i = 0; i < totalMonths; i++) {
      const paddedMonth = (month + 1).toString().padStart(2, '0');
      const monthStr = `${year}-${paddedMonth}`;
      balances.push({ month: monthStr, balance: balance });
      balance += 2;
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    this.monthBalances = balances;
  }

  generateMonthBalancesForUserId(userId: number): void {
    this.profileService.getUserById(userId).subscribe({
      next: (user: User) => {
        this.absenceUser = user;
        this.generateMonthBalancesForUser(user);
      },
      error: (err) => console.error("Erreur récupération utilisateur par ID", err)
    });
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
        console.log(absence);

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

        if (this.isValidationMode && absence.userId) {
          this.generateMonthBalancesForUserId(absence.userId);
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
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('success.title'),
                detail: this.translate.instant('absence_validated_successfully'),
              });

              this.currentUser.leaveBalance = updatedUser.leaveBalance;

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
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('success.title'),
            detail: this.translate.instant('absence_validated_successfully'),
          });

          this.currentUser.leaveBalance = updatedUser.leaveBalance;

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
    if (this.isValidationMode && this.absenceUser?.leaveBalance != null) {
      return this.absenceUser.leaveBalance;
    }
    return this.currentUser?.leaveBalance ?? null;
  }


}
