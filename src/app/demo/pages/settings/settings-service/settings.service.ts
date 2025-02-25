import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../authentication/auth-service/authentification.service';


@Injectable({
  providedIn: 'root'  
})
export class SettingsService {

  private apiUrl = 'http://localhost:8080/api/settings';


 
  
  constructor(private http: HttpClient , private auth:AuthService) {}
  changePassword(oldPassword: string, newPassword: string, confirmNewPassword: string): Observable<string> {
    const token = this.auth.getAccessToken();
    console.log('Token:', token); // Add this line to log the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.post<string>(
      `${this.apiUrl}/change-password`,
      { oldPassword, newPassword, confirmNewPassword },
      { headers, responseType: 'text' as 'json' }
    );
  }
  

}
