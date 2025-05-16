import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { ReactiveFormsModule } from '@angular/forms';
import { CrasService } from '../cra/cra-service/cras.service';
import { ProfileService } from '../profile/profile/profile.service';
import { AuthService } from '../authentication/auth-service/authentification.service';
import { Calendre } from '../cra/model/Calendre';
import { Cra, Status } from '../cra/model/Cra';
import { DayEntry } from '../cra/model/DayEntry';
import { TooltipModule } from 'primeng/tooltip';



interface Day {
  date: Date;
  value: string;
}

interface CalendarMonth {
  year: number;
  month: number;
  days: Day[];
  visible: boolean;
  client?: string;
  mission?: string;
}

@Component({
  selector: 'app-mes-cras',
  imports: [
    FormsModule,
    CommonModule,
    TranslateModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule,
    InputTextModule,
    FloatLabel,
    ReactiveFormsModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './mes-cras.component.html',
  styleUrl: './mes-cras.component.scss',
  standalone: true,
})
export class MesCrasComponent implements OnInit {
  isExpanded: boolean = false;
  selectedMonth: string = '';
  selectedYear: string = '';
  calendars: Calendre[] = [];
  commentaire: string = '';
  commentaireClient: string = '';
  validValues: number[] = [0, 0.5, 1];
  cra: Cra | null = null;
  readonlyMode: boolean = false;
  selectedCalendar: Calendre | null = null;
  isValidationMode: boolean = false;
  


  constructor(private route: ActivatedRoute,
    private messageService: MessageService,
    private translate: TranslateService,
    private craService: CrasService,
    private profileService: ProfileService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedMonth = params['month'];
      this.selectedYear = params['year'];

      const craId = params['craId'];

      this.isValidationMode = params['validationMode'] === 'true';

      if (craId) {
        this.loadCra(craId);
      } else {
        this.calendars = [];
        this.isExpanded = false;
        this.commentaire = '';
        this.commentaireClient = '';
      }
    });
  }

  loadCra(craId: number): void {
    this.craService.getCraById(craId).subscribe({
      next: (cra: Cra) => {
        this.cra = cra;
        console.log('CRA chargé:', this.cra)

        this.selectedYear = cra.year.toString();
        this.selectedMonth = cra.month.toString();
        this.commentaire = cra.commentaire || '';
        this.commentaireClient = cra.commentaireClient || '';

        this.calendars = cra.calendres.map((calendar) => {
          const fullDays = this.createEmptyDays();

          for (let day of fullDays) {
            const found = calendar.days.find(d => new Date(d.date).toDateString() === new Date(day.date).toDateString());
            if (found) {
              day.value = found.value;
            }
          }

          return {
            ...calendar,
            days: fullDays
          };
        });

        this.isExpanded = true;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('error.loading_cra'),
        });
      },
    });
  }


  addCalendar(): void {
    if (this.isValidationMode || this.cra?.status === Status.VALIDE) {
      return;
    }

    if (this.calendars.length < 3) {
      const newCalendar: Calendre = {
        idCalendre: null,
        client: '',
        mission: '',
        days: this.createEmptyDays()
      };
      this.calendars.push(newCalendar);
      this.isExpanded = true;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('calendar.limit_reached'),
        detail: this.translate.instant('calendar.limit_detail'),
      });
    }
  }

  createEmptyDays(): DayEntry[] {
    const days: DayEntry[] = [];
    const year = parseInt(this.selectedYear, 10);
    const month = parseInt(this.selectedMonth, 10) - 1;
    const date = new Date(year, month, 1);
    const currentMonth = date.getMonth();

    while (date.getMonth() === currentMonth) {
      const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      days.push({
        id: null,
        date: formattedDate,
        value: ''
      });
      date.setDate(date.getDate() + 1);
    }

    return days;
  }

 saveCra(): void {
  const calendrierInvalide = this.calendars.some(
    calendar => !calendar.client?.trim() || !calendar.mission?.trim()
  );

  if (calendrierInvalide) {
    this.messageService.add({
      severity: 'warn',
      summary: this.translate.instant('warning.title'),
      detail: this.translate.instant('client_mission_required'),
    });
    return;
  }

  const isNewCra = !this.cra?.idCra; 

  const craToSave: Cra = {
    idCra: this.cra?.idCra || null,
    month: +this.selectedMonth,
    year: +this.selectedYear,
    status: Status.IN_PROGRESS,
    userId: null,
    send: this.cra?.send || false,
    commentaire: this.commentaire || this.cra?.commentaire || '',
    commentaireClient: this.commentaireClient || this.cra?.commentaireClient || '',
    calendres: this.calendars.map(calendar => ({
      ...calendar,
      days: calendar.days,
    })),
  };

  const saveSuccess = (savedCra: Cra) => {
    this.cra = savedCra;
    this.commentaire = savedCra.commentaire || '';
    this.commentaireClient = savedCra.commentaireClient || '';

    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('success.title'),
      detail: this.translate.instant(isNewCra ? 'cra_saved_successfully' : 'cra_updated_successfully'),
    });
  };

  if (this.cra?.idCra) {
    this.craService.updateCra(this.cra.idCra, craToSave).subscribe({
      next: saveSuccess,
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('error.updating_cra'),
        });
      },
    });
  } else {
    this.craService.saveCra(craToSave).subscribe({
      next: saveSuccess,
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('error.saving_cra'),
        });
      },
    });
  }
}



  validateCra(): void {
    if (!this.cra?.idCra) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('error.title'),
        detail: this.translate.instant('cra_not_found'),
      });
      return;
    }

    if (this.commentaireClient) {
      const craToSave: Cra = {
        ...this.cra,
        commentaireClient: this.commentaireClient || this.cra?.commentaireClient || '',
      };

      this.craService.updateCra(this.cra.idCra, craToSave).subscribe({
        next: (updatedCra) => {
          this.cra = updatedCra;
          console.log('CRA updated:', this.cra)

          this.craService.validateCra(this.cra.idCra).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('success.title'),
                detail: this.translate.instant('cra_validated_successfully'),
              });
              if (this.cra) {
                this.cra.status = Status.VALIDE;
              }
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('error.title'),
                detail: this.translate.instant('error.validating_cra'),
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
        }
      });
    } else {
      this.craService.validateCra(this.cra.idCra).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('success.title'),
            detail: this.translate.instant('cra_validated_successfully'),
          });
          if (this.cra) {
            this.cra.status = Status.VALIDE;
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('error.title'),
            detail: this.translate.instant('error.validating_cra'),
          });
        },
      });
    }
  }

  rejectCra(): void {
    if (!this.cra?.idCra) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('error.title'),
        detail: this.translate.instant('cra_not_found'),
      });
      return;
    }

    if (this.commentaireClient) {
      const craToSave: Cra = {
        ...this.cra,
        commentaireClient: this.commentaireClient || this.cra?.commentaireClient || '',
      };

      this.craService.updateCra(this.cra.idCra, craToSave).subscribe({
        next: (updatedCra) => {
          this.cra = updatedCra;

          this.craService.rejectCra(this.cra.idCra).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('success.title'),
                detail: this.translate.instant('cra_rejected_successfully'),
              });
              if (this.cra) {
                this.cra.status = Status.REJETE;
              }
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('error.title'),
                detail: this.translate.instant('error.rejecting_cra'),
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
        }
      });
    } else {
      this.craService.rejectCra(this.cra.idCra).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('success.title'),
            detail: this.translate.instant('cra_rejected_successfully'),
          });
          if (this.cra) {
            this.cra.status = Status.REJETE;
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('error.title'),
            detail: this.translate.instant('error.rejecting_cra'),
          });
        },
      });
    }
  }

  selectCalendar(calendar: Calendre) {
    this.selectedCalendar = calendar;
    this.isExpanded = true;
  }

  deleteCalendar(calendar: Calendre): void {
    if (this.isValidationMode || this.cra?.status === Status.VALIDE) {
      return;
    }

    const index = this.calendars.indexOf(calendar);
    if (index !== -1) {
      this.calendars.splice(index, 1);
      this.messageService.add({
        severity: 'info',
        summary: this.translate.instant('calendar.deleted'),
        detail: this.translate.instant('calendar.deleted_detail')
      });
    }
  }

  remplirTous(calendar: Calendre): void {
    if (this.isValidationMode || this.cra?.status === Status.VALIDE) {
      return;
    }

    calendar.days.forEach((day) => {
      const dayDate = new Date(day.date);
      if (!this.isWeekend(dayDate)) {
        let totalOther = 0;

        for (let cal of this.calendars) {
          if (cal !== calendar) {
            for (let d of cal.days) {
              if (new Date(d.date).toDateString() === dayDate.toDateString()) {
                totalOther += parseFloat(d.value) || 0;
              }
            }
          }
        }

        const remaining = 1 - totalOther;
        if (remaining > 0) {
          day.value = Math.min(1, remaining).toString();
        } else {
          day.value = '0';
        }
      }
    });
  }

  viderTous(calendar: Calendre): void {
    if (this.isValidationMode || this.cra?.status === Status.VALIDE) {
      return;
    }

    calendar.days.forEach((day) => {
      const dayDate = new Date(day.date);
      if (!this.isWeekend(dayDate)) {
        day.value = '0';
      }
    });
  }

  isWeekend(dateInput: string | Date): boolean {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const day = date.getDay();
    return day === 0 || day === 6;
  }

    getDayLetter(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const dayName = date.toLocaleDateString(this.translate.currentLang || 'en-US', { weekday: 'long' });
    return dayName.charAt(0).toUpperCase();
  }

  getRemplisTotalValue(calendar: Calendre): number {
    return calendar.days.reduce((total: number, day: DayEntry) => {
      return total + (parseFloat(day.value) || 0);
    }, 0);
  }

  getTotalWorkingDays(calendar: Calendre): number {
    return calendar.days.filter((day: DayEntry) => {
      const dayDate = new Date(day.date);
      return !this.isWeekend(dayDate);
    }).length;
  }

  getCompletionPercentage(calendar: Calendre): number {
    const total = this.getTotalWorkingDays(calendar);
    if (total === 0) return 0;
    return Math.round((this.getRemplisTotalValue(calendar) / total) * 100);
  }

  getTotalRemplis(): number {
    if (this.calendars.length === 0) return 0;

    const year = +this.selectedYear;
    const month = +this.selectedMonth - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    let totalFilled = 0;

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const date = new Date(year, month, dayNum);

      if (this.isWeekend(date)) continue;

      let dayTotal = 0;
      const dateStr = date.toDateString();

      for (let calendar of this.calendars) {
        for (let day of calendar.days) {
          const dayDate = new Date(day.date);
          if (dayDate.toDateString() === dateStr) {
            dayTotal += parseFloat(day.value) || 0;
          }
        }
      }

      totalFilled += Math.min(dayTotal, 1);
    }

    return totalFilled;
  }

  getTotalWorkingDaysAllCalendars(): number {
    const year = +this.selectedYear;
    const month = +this.selectedMonth - 1;
    let count = 0;
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      const day = date.getDay();
      if (day !== 0 && day !== 6) count++;
      date.setDate(date.getDate() + 1);
    }
    return count;
  }

  getGlobalCompletionPercentage(): number {
    const workingDays = this.getTotalWorkingDaysAllCalendars();
    const totalFilled = this.getTotalRemplis();

    if (workingDays === 0) return 0;

    return Math.round((totalFilled / workingDays) * 100);
  }

  getAverageRemplis(): number {
    const totalCalendars = this.calendars.length;
    if (totalCalendars === 0) return 0;
    return Math.round(this.getTotalRemplis() / totalCalendars);
  }

  createEmptyCalendar(): Calendre {
    return {
      idCalendre: null,
      client: '',
      mission: '',
      days: this.createEmptyDays()
    };
  }

  validateInput(day: DayEntry, calendar: Calendre): void {
    const validValues = ['0', '0.5', '1'];

    if (!validValues.includes(day.value)) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('input_warn.value_invalid'),
        detail: this.translate.instant('input_warn.valid_values'),
      });
      day.value = '0';
      return;
    }

    const dateStr = new Date(day.date).toDateString();
    const totalForDay = this.calendars.reduce((sum, cal) => {
      return sum + cal.days
        .filter(d => new Date(d.date).toDateString() === dateStr)
        .reduce((subSum, d) => subSum + parseFloat(d.value || '0'), 0);
    }, 0);

    if (totalForDay > 1) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('input_warn.value_exceeded'),
        detail: this.translate.instant('input_warn.total_cannot_exceed_one'),
      });
      day.value = '0';
    }
  }

  private showError(summaryKey: string, detailKey: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant(summaryKey),
      detail: this.translate.instant(detailKey),
    });
  }

  synchronizeDayValue(changedCalendar: Calendre, changedDay: DayEntry): void {
    if (this.isValidationMode || this.cra?.status === Status.VALIDE) {
      return;
    }

    const changedDate = new Date(changedDay.date);
    const dateStr = changedDate.toDateString();
    const maxTotal = 1;
    const currentValue = parseFloat(changedDay.value) || 0;

    let totalOther = 0;
    for (let calendar of this.calendars) {
      if (calendar !== changedCalendar) {
        for (let day of calendar.days) {
          const dayDate = new Date(day.date);
          if (dayDate.toDateString() === dateStr) {
            totalOther += parseFloat(day.value) || 0;
          }
        }
      }
    }

    const remaining = maxTotal - totalOther;

    if (currentValue > remaining) {
      let adjustedValue = 0;
      if (remaining >= 1) adjustedValue = 1;
      else if (remaining >= 0.5) adjustedValue = 0.5;
      else adjustedValue = 0;

      changedDay.value = adjustedValue.toString();

      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('input_warn.value_exceeded'),
        detail: this.translate.instant('input_warn.total_cannot_exceed_one'),
      });
    }

    const newTotal = (parseFloat(changedDay.value) || 0) + totalOther;
    if (newTotal > maxTotal) {
      this.adjustOtherCalendars(changedCalendar, changedDay);
    }
  }

  adjustOtherCalendars(changedCalendar: Calendre, changedDay: DayEntry): void {
    if (this.isValidationMode || this.cra?.status === Status.VALIDE) {
      return;
    }

    const changedDate = new Date(changedDay.date);
    const dateStr = changedDate.toDateString();
    const maxTotal = 1;
    const currentValue = parseFloat(changedDay.value) || 0;
    let remainingNeeded = currentValue;

    for (let calendar of this.calendars) {
      if (calendar !== changedCalendar) {
        for (let day of calendar.days) {
          const dayDate = new Date(day.date);
          if (dayDate.toDateString() === dateStr) {
            remainingNeeded += parseFloat(day.value) || 0;
          }
        }
      }
    }

    if (remainingNeeded > maxTotal) {
      const excessAmount = remainingNeeded - maxTotal;

      for (let calendar of this.calendars) {
        if (calendar !== changedCalendar && excessAmount > 0) {
          for (let day of calendar.days) {
            const dayDate = new Date(day.date);
            if (dayDate.toDateString() === dateStr) {
              const dayValue = parseFloat(day.value) || 0;
              if (dayValue > 0) {
                day.value = '0';

                this.messageService.add({
                  severity: 'info',
                  summary: this.translate.instant('input_warn.values_adjusted'),
                  detail: this.translate.instant('input_warn.other_calendar_adjusted'),
                });
                break;
              }
            }
          }
        }
      }
    }
  }

  getFormattedTotalRemplis(): string {
    const total = this.getTotalRemplis();
    if (total === 0) return '0';
    return total === Math.floor(total) ? total.toString() : total.toFixed(1);
  }

  sendCra(): void {
    if (this.isValidationMode || this.cra?.status === Status.VALIDE) {
      return;
    }

    if (!this.cra?.idCra) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('error.title'),
        detail: this.translate.instant('cra_not_saved'),
      });
      return;
    }

    const craToSave: Cra = {
      ...this.cra,
      commentaire: this.commentaire,
      commentaireClient: this.commentaireClient
    };

    this.craService.updateCra(this.cra.idCra, craToSave).subscribe({
      next: (updatedCra) => {
        this.cra = updatedCra;

        this.craService.sendCra(this.cra.idCra).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('success.title'),
              detail: this.translate.instant('cra_sent_successfully'),
            });
            if (this.cra) {
              this.cra.send = true;
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('error.title'),
              detail: this.translate.instant('sending_cra'),
            });
          },
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('updating_comments'),
        });
      }
    });
  }
  
}