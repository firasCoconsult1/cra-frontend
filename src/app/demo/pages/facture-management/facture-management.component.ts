import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute } from '@angular/router';
import { CrasService } from '../cra/cra-service/cras.service';
import { Cra } from '../cra/model/Cra';
import { Calendre } from '../cra/model/Calendre';
import { User } from '../profile/model/user';
import { ProfileService } from '../profile/profile/profile.service';
import { Button } from 'primeng/button';
import { FactureService } from './Facture-service/facture.service';
import { Facture, FactureStatus } from './model/facture';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-facture-management',
  imports: [CommonModule, FormsModule, DropdownModule, DatePickerModule, TranslateModule, InputTextModule, Button, ToastModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './facture-management.component.html',
  styleUrl: './facture-management.component.scss'
})
export class FactureManagementComponent implements OnInit {
  @ViewChild('invoiceContent', { static: false }) invoiceContent!: ElementRef;


  craId: number;
  cra: Cra;
  calendre: Calendre[] = [];
  date: Date = new Date();
  reference: string;
  user: User;
  isValidationMode: boolean = false;
  downloadMode: boolean = false;

  factures: Facture[] = [];
  month: number = new Date().getMonth() + 1;
  year: number = new Date().getFullYear();
  factureId: number | null = null;
  facture: Facture | null = null;
  status: FactureStatus;
  factureUploaded: boolean = false;



  constructor(private messageService: MessageService, private route: ActivatedRoute, private craService: CrasService, private profileService: ProfileService, private factureService: FactureService, private translate: TranslateService) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.craId = params['craId'] ? +params['craId'] : null;
      this.isValidationMode = params['validationMode'] === 'true';
      this.downloadMode = params['downloadMode'] === 'true';
      this.month = params['month'] ? +params['month'] : new Date().getMonth() + 1;
      this.year = params['year'] ? +params['year'] : new Date().getFullYear();
      this.factureId = params['factureId'] ? +params['factureId'] : null;
      this.status = params['status'] ? params['status'] as FactureStatus : FactureStatus.NON_PAYE;

      if ((this.isValidationMode || this.downloadMode) && this.factureId) {
        this.factureService.getFactureById(this.factureId).subscribe(facture => {
          this.facture = facture;
          this.reference = facture.reference;
          this.craId = facture.craId;
          if (this.craId) {
            this.getCraById(this.craId);
          }
        });
      } else if (this.craId) {
        this.getCraById(this.craId);
        this.generateReference();
      } else {
        this.generateReference();
      }
    });
  }






  getCraById(id: number) {
    this.craService.getCraById(id).subscribe({
      next: (res) => {
        this.cra = res;
        this.calendre = this.cra.calendres;

        if (this.cra.userId) {
          this.getUserById(this.cra.userId);
          this.getTotalDays();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  getTotalDays(): number {
    return this.calendre
      .flatMap(cal => Array.isArray(cal.days) ? cal.days : [])
      .map(day => Number(day.value) || 0)
      .reduce((sum, val) => sum + val, 0);
  }
  getUserById(userId: number) {
    this.profileService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;

        console.log('User loaded:', this.user);
      },
      error: (err) => {
        console.error('Error loading user:', err);
      }
    });
  }
  generateReference(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    this.factureService.getFactures(0, 10).subscribe({
      next: (factures) => {
        this.factures = Array.isArray(factures) ? factures : [];
        const factureNumber = this.factures.length + 1;
        this.reference = `TimeBill-Fac-${dateStr}-${factureNumber}`;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des factures', err);
        this.factures = [];
        this.reference = `TimeBill-Fac-${dateStr}-1`;
      }
    });
  }

  getTotalTTC(): number {
    if (!this.user) return 0;
    if (this.user.leaveBalance > 0)
      return this.getTotalDays() * this.user.tjm;
    else
      return this.getTotalDays() * this.user.tjm - (Math.abs(this.user.leaveBalance) * this.user.tjm);
  }
  getFactureMonthYear(): Date {
    return new Date(this.year, this.month - 1, 1);
  }

  saveFacture() {

    const facture: Facture = {

      idFacture: undefined,
      reference: this.reference,
      month: this.date.getMonth() + 1,
      year: this.date.getFullYear(),
      montantTotal: this.getTotalTTC(),
      userId: this.user.id,
      status: FactureStatus.NON_PAYE,
      craId: this.craId
    };

    this.factureService.createFacture(facture).subscribe({
      next: (res) => {
        console.log('Facture saved:', res);
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('success.title'),
          detail: this.translate.instant('FACTURE.CREATED_SUCCESS')
        });
        this.generateReference();
      },
      error: (err) => {
        console.error('Error saving facture:', err);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('FACTURE.CREATION_FAILED')
        });
      }
    });
  }
  async downloadFacturePDF() {
    try {
      const element = this.invoiceContent.nativeElement;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = 210;
      const pageHeight = 297;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const aspectRatio = canvasWidth / canvasHeight;

      const targetHeight = pageHeight * 0.5;
      const targetWidth = targetHeight * aspectRatio;

      const xOffset = (pageWidth - targetWidth) / 2;
      const yOffset = (pageHeight - targetHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, targetWidth, targetHeight);

      pdf.save(`facture-${this.reference}.pdf`);

      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success.title'),
        detail: this.translate.instant('FACTURE.DOWNLOADED_SUCCESS')
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error.title'),
        detail: this.translate.instant('FACTURE.DOWNLOAD_FAILED')
      });
    }
  }
  payerFacture() {
    this.factureService.payerFacture(this.factureId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('success.title'),
          detail: this.translate.instant('FACTURE.PAID_SUCCESS')
        });
      },
      error: (err) => {
        console.error('Error paying facture:', err);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('FACTURE.PAYMENT_FAILED')
        });
      }
    });
  }







  async uploadCurrentFacture() {
    if (!this.user) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('warning.title'),
        detail: 'User information not available'
      });
      return;
    }

    try {
      const element = this.invoiceContent.nativeElement;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = 210;
      const pageHeight = 297;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const aspectRatio = canvasWidth / canvasHeight;

      const targetHeight = pageHeight * 0.5;
      const targetWidth = targetHeight * aspectRatio;

      const xOffset = (pageWidth - targetWidth) / 2;
      const yOffset = (pageHeight - targetHeight) / 2;



      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, targetWidth, targetHeight, undefined, 'MEDIUM');

      const pdfBlob = pdf.output('blob');

      const fileSizeMB = pdfBlob.size / (1024 * 1024);
      console.log(`Taille du PDF généré: ${fileSizeMB.toFixed(2)} MB`);

      if (fileSizeMB > 8) {
        this.messageService.add({
          severity: 'warn',
          summary: this.translate.instant('warning.title'),
          detail: `Fichier volumineux (${fileSizeMB.toFixed(2)} MB). L'upload peut échouer.`
        });
      }

      const pdfFile = new File([pdfBlob], `facture-${this.reference}.pdf`, {
        type: 'application/pdf'
      });

      const username = this.user?.username || 'current_user';

      this.factureService.uploadFile(username, pdfFile).subscribe({
        next: (response) => {
          this.factureUploaded = true; 

          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('success.title'),
            detail: this.translate.instant('FACTURE.UPLOADED_SUCCESS')
          });
        },
        error: (err) => {
          console.error('Error uploading facture file', err);

          if (err.status === 413 || err.error?.includes('Maximum upload size exceeded')) {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('error.title'),
              detail: 'Fichier trop volumineux. La taille maximale autorisée est de 10MB.'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('error.title'),
              detail: this.translate.instant('FACTURE.UPLOAD_FAILED')
            });
          }
        }
      });

    } catch (error) {
      console.error('Error generating and uploading PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error.title'),
        detail: this.translate.instant('FACTURE.UPLOAD_FAILED')
      });
    }
  }
}



