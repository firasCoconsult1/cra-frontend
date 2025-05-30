// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';


import { CrasService } from '../pages/cra/cra-service/cras.service';
import { AbsenceService } from '../pages/absences-management/services/absence-service.service';
import { FactureService } from '../pages/facture-management/Facture-service/facture.service';
import { ResourceManagementService } from '../pages/resource-management/service/resource-management.service';

@Component({
  selector: 'app-dashboard',
  imports: [ChartModule, CommonModule, SharedModule, ButtonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  craStatusChartData: any;
  absenceStatusChartData: any;
  factureByStatusChartData: any;
  userStatusChartData: any;
  userStatusChartOptions: any;
  lineChartData: any;
  lineChartOptions: any;


  constructor(
    private craService: CrasService,
    private absenceService: AbsenceService,
    private factureService: FactureService,
    private translate: TranslateService,
    private ressourceService: ResourceManagementService

  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe(() => {
      this.loadCraStatusChart();
      this.loadAbsenceStatusChart();
      this.loadFacturesByStatusChart();
      this.loadUserStatusChart();
      this.loadLineChartData();
    });

    this.translate.get('status.VALIDE').subscribe(() => {
      this.loadCraStatusChart();
      this.loadAbsenceStatusChart();
      this.loadFacturesByStatusChart();
      this.loadUserStatusChart();
      this.loadLineChartData();
    });
  }

  loadCraStatusChart() {
    this.craService.getAllCraForDashboard().subscribe(cras => {
      const statusCount = { VALIDE: 0, IN_PROGRESS: 0, REJETE: 0 };
      cras.forEach(cra => {
        if (statusCount[cra.status] !== undefined) statusCount[cra.status]++;
      });

      const statusOrder = ['VALIDE', 'IN_PROGRESS', 'REJETE'];
      const translatedLabels = statusOrder.map(status =>
        this.translate.instant(`status.${status}`)
      );

      this.craStatusChartData = {
        labels: translatedLabels,
        datasets: [{
          data: statusOrder.map(status => statusCount[status]),
          backgroundColor: ['#66BB6A', '#42A5F5', '#EF5350']
        }]
      };
    });
  }



  loadAbsenceStatusChart() {
    this.absenceService.getAllAbsencesForDashboard().subscribe(absences => {
      const statusCount = { VALIDE: 0, IN_PROGRESS: 0, REJETE: 0 };
      absences.forEach(absence => {
        if (statusCount[absence.status] !== undefined) statusCount[absence.status]++;
      });

      const statusOrder = ['VALIDE', 'IN_PROGRESS', 'REJETE'];
      const translatedLabels = statusOrder.map(status =>
        this.translate.instant(`status.${status}`)
      );

      this.absenceStatusChartData = {
        labels: translatedLabels,
        datasets: [{
          data: statusOrder.map(status => statusCount[status]),
          backgroundColor: ['#66BB6A', '#42A5F5', '#EF5350'] // Vert, Bleu, Rouge
        }]
      };
    });
  }

  loadFacturesByStatusChart() {
    this.factureService.getAllFacturesForDashboard().subscribe(factures => {
      const statusCount = { PAYE: 0, NON_PAYE: 0 };
      factures.forEach(facture => {
        if (statusCount[facture.status] !== undefined) statusCount[facture.status]++;
      });

      const statusOrder = ['PAYE', 'NON_PAYE'];
      const translatedLabels = statusOrder.map(status =>
        this.translate.instant(`status.${status}`)
      );

      this.factureByStatusChartData = {
        labels: translatedLabels,
        datasets: [{
          data: statusOrder.map(status => statusCount[status]),
          backgroundColor: ['#66BB6A', '#EF5350'] // Vert, Bleu, Rouge
        }]
      };
    });
  }

  loadUserStatusChart() {
    this.ressourceService.getAllUsersForDashboard().subscribe(users => {
      let enabled = 0, disabled = 0, invited = 0, notInvited = 0;
      users.forEach(user => {
        if (user.enabled) enabled++;
        else disabled++;
        if (user.invited) invited++;
        else notInvited++;
      });

      this.userStatusChartData = {
        labels: [
          this.translate.instant('enabled'),
          this.translate.instant('disabled'),
          this.translate.instant('invited'),
          this.translate.instant('not invited')
        ],
        datasets: [{
          label: this.translate.instant('breadcrumb.users'),
          data: [enabled, disabled, invited, notInvited],
          backgroundColor: ['#66BB6A', '#EF5350', '#42A5F5', '#FFA726']
        }]
      };
    });
    this.userStatusChartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    };
  }

  loadLineChartData() {
    this.factureService.getAllFacturesForDashboard().subscribe(factures => {
      this.absenceService.getAllAbsencesForDashboard().subscribe(absences => {
        this.craService.getAllCraForDashboard().subscribe(cras => {
          const months = this.getAllMonths(factures, absences, cras);

          const factureCounts = months.map(m => factures.filter(f => this.getMonthYear(f) === m).length);
          const absenceCounts = months.map(m => absences.filter(a => this.getMonthYear(a) === m).length);
          const craCounts = months.map(m => cras.filter(c => this.getMonthYear(c) === m).length);

          this.lineChartData = {
            labels: months,
            datasets: [
              {
                label: this.translate.instant('FACTURES'),
                data: factureCounts,
                borderColor: '#42A5F5',
                fill: false,
                tension: 0.1
              },
              {
                label: this.translate.instant('Absences'),
                data: absenceCounts,
                borderColor: '#EF5350',
                fill: false,
                tension: 0.1
              },
              {
                label: this.translate.instant('CRA'),
                data: craCounts,
                borderColor: '#66BB6A',
                fill: false,
                tension: 0.1
              }
            ]
          };

          this.lineChartOptions = {
            responsive: true,
            plugins: {
              legend: { display: true }
            },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
          };
        });
      });
    });
  }

  getMonthYear(obj: any): string {
    return `${obj.year}-${String(obj.month).padStart(2, '0')}`;
  }

  getAllMonths(...lists: any[][]): string[] {
    const monthsSet = new Set<string>();
    lists.forEach(list => {
      list.forEach(obj => monthsSet.add(this.getMonthYear(obj)));
    });
    return Array.from(monthsSet).sort();
  }
}