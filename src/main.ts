import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; 
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './app/demo/pages/authentication/interceptors/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura
        }
    }),
    importProvidersFrom(BrowserModule, AppRoutingModule),
    JwtHelperService,
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor])
      
    ),
    provideToastr(),
    
  
  ]
}).catch((err) => console.error(err));