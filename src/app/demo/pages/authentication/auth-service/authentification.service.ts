import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, ResetPasswordRequest } from '../model/auth-model';
import { LoginResponse } from '../model/auth-model';
import { RegisterRequest } from '../model/auth-model';



@Injectable({
  providedIn: 'root'  
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }
  register(user: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  requestPasswordReset(username: string): Observable<string> {    
    return this.http.post(`${this.apiUrl}/request-password-reset`, null, {
      params:{username},
      responseType: 'text'
    });
  }

  resetPassword(token: string, resetData: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, resetData, {
      params: new HttpParams().set('token', token),
      responseType: 'text'
    });
  }

  


  setToken(token: string,refreshToken:string): void {
    localStorage.setItem('accessToken', this.ACCESS_TOKEN_KEY);
    localStorage.setItem('refreshToken', this.REFRESH_TOKEN_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}