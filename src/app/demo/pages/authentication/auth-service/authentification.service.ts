import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginRequest, ResetPasswordRequest } from '../model/auth-model';
import { LoginResponse } from '../model/auth-model';
import { RegisterRequest } from '../model/auth-model';


@Injectable({
  providedIn: 'root'  
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private  USER_KEY = 'auth-user';
  
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

  
  setToken(accessToken: string, refreshToken: string): void {
    if (!accessToken || !refreshToken) {
      console.error('Attempted to set invalid tokens', {accessToken, refreshToken });
      return;
    }
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (!token || token === 'undefined') {
      return null;
    }
    return token;
  }

  getRefreshToken(): string | null {
    const token = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!token || token === 'undefined') {
      return null;
    }
    return token;
  }

  

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private loggedIn = new BehaviorSubject<boolean>(this.isUserLoggedIn());

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  

  clean(): void {
    window.localStorage.clear();
    this.loggedIn.next(false);
  }

  public saveUser(user: any): void {
    window.localStorage.removeItem(this.USER_KEY);
    window.localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.loggedIn.next(true);
  }

  public getUser(): any {
    const user = window.localStorage.getItem(this.USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return null;
  }

  public isUserLoggedIn(): boolean {
    const user = window.localStorage.getItem(this.USER_KEY);
    if (user) {
      return true;
    }

    return false;
  }
}
