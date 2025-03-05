import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginRequest, ResetPasswordRequest, LoginResponse, RegisterRequest } from '../model/auth-model';

@Injectable({
  providedIn: 'root'  
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'auth-user';
  
  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  register(user: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  requestPasswordReset(username: string): Observable<string> {    
    return this.http.post(`${this.apiUrl}/request-password-reset`, null, {
      params: { username },
      responseType: 'text'
    });
  }

  resetPassword(token: string, resetData: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, resetData, {
      params: new HttpParams().set('token', token),
      responseType: 'text'
    });
  }

  setToken(accessToken: string, refreshToken: string): void {
    if (!accessToken || !refreshToken) {
      console.error('Attempted to set invalid tokens', { accessToken, refreshToken });
      return;
    }
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY) ?? null;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) ?? null;
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.clean();
  }

  private loggedIn = new BehaviorSubject<boolean>(this.isUserLoggedIn());

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  clean(): void {
    window.localStorage.clear();
    this.loggedIn.next(false);
  }

  saveUser(user: any): void {
    window.localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.loggedIn.next(true);
  }

  getUser(): any {
    const user = window.localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isUserLoggedIn(): boolean {
    return !!window.localStorage.getItem(this.USER_KEY);
  }
}
