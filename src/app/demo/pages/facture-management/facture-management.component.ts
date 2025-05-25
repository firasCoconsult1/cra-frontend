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


  constructor(private messageService: MessageService, private route: ActivatedRoute, private craService: CrasService, private profileService: ProfileService, private factureService: FactureService, private translate: TranslateService) { }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.craId = params['craId'] ? +params['craId'] : null;
      if (this.craId) {
        this.getCraById(this.craId);
      }
    });
    this.generateReference();

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
          detail: this.translate.instant('FACTURE.CREATED_SUCCESS' ) });
        this.generateReference();
      },
      error: (err) => {
        console.error('Error saving facture:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: this.translate.instant('error.title'), 
          detail: this.translate.instant('FACTURE.CREATION_FAILED' ) });
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
      
      const imgWidth = 210; 
      const pageHeight = 295; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`facture-${this.reference}.pdf`);
      
      this.messageService.add({ 
        severity: 'success',
        summary: this.translate.instant('success.title'),
        detail: this.translate.instant('FACTURE.DOWNLOADED_SUCCESS' ) 
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.messageService.add({ 
       severity: 'success',
        summary: this.translate.instant('error.title'),
        detail: this.translate.instant('FACTURE.DOWNLOAD_FAILED' ) 
      });
    }
  }




}
