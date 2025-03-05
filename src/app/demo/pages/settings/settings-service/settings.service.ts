import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private apiUrl = 'http://localhost:8080/api/settings';

  constructor(private http: HttpClient) {}

  changePassword(oldPassword: string, newPassword: string, confirmNewPassword: string): Observable<string> {
    return this.http.post<string>(
      `${this.apiUrl}/change-password`,
      { oldPassword, newPassword, confirmNewPassword },
      { responseType: 'text' as 'json' } 
    );
  }
}
