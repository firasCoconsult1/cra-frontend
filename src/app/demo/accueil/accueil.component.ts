import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core'; 
import { Card } from 'primeng/card';



@Component({
  selector: 'app-acceuil',
  imports: [TranslateModule,Card],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss'
})
export class AcceuilComponent {

}
