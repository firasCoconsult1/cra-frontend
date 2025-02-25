import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';

@Component({
  selector: 'app-auth-activation',
  imports: [RouterModule,CommonModule ],
  templateUrl: './auth-activation.component.html',
  styleUrl: './auth-activation.component.scss'
})
export class AuthActivationComponent implements OnInit {
  isSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.isSuccess = params['status'] === 'success';
      
      timer(3000).subscribe(() => {
        this.router.navigate(['/auth/signin']);
      });
    });
  }
}
