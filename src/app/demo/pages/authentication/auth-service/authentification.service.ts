import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, Observable, BehaviorSubject, throwError, tap, of } from 'rxjs';
import { LoginRequest, ResetPasswordRequest, LoginResponse, RegisterRequest } from '../model/auth-model';
import { User } from '../../profile/model/user';
import { Injectable } from '@angular/core';

interface RefreshTokenResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'auth-user';

  // On initialise le BehaviorSubject selon la présence du token
  private loggedIn = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.accessToken && response.refreshToken) {
          this.setToken(response.accessToken, response.refreshToken);
          this.saveUser(response); // si tu reçois l'utilisateur dans la réponse
        }
      }),
      catchError(this.handleError)
    );
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

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh-token`, { refreshToken });
  }

  setToken(accessToken: string, refreshToken: string): void {
    if (!accessToken || !refreshToken) {
      console.error('Attempted to set invalid tokens', { accessToken, refreshToken });
      return;
    }
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.loggedIn.next(true);
  }

  setAccessToken(accessToken: string): void {
    if (!accessToken) {
      console.error('Attempted to set invalid access token');
      return;
    }
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    this.loggedIn.next(true); // <-- Ajouté pour garder l'état à jour
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
    localStorage.removeItem(this.USER_KEY);
    this.loggedIn.next(false);
  }

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  saveUser(user: any): void {
    window.localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.loggedIn.next(true);
  }

  getUser(): any {
    const user = window.localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  private hasValidToken(): boolean {
    // Vérifie juste la présence du token (tu peux améliorer pour vérifier la validité)
    return !!localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration', error);
      return true;
    }
  }

  ensureValidToken(): Observable<string | null> {
    if (this.isTokenExpired()) {
      return this.refreshToken().pipe(
        tap(() => console.log('Token refreshed successfully')),
        map(() => this.getAccessToken()),
        catchError(error => {
          console.error('Failed to refresh token', error);
          this.logout();
          return of(null);
        })
      );
    }
    return of(this.getAccessToken());
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401 || error.status === 404) {
      return throwError(() => new Error('Invalid credentials'));
    } else {
      return throwError(() => new Error('Something went wrong; please try again later.'));
    }
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/current-user`);
  }

  getByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/username`, { params: { username } })
      .pipe(catchError(this.handleError));
  }

  getEmailFromToken(token: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/get-email-from-token`, {
      params: { token },
      responseType: 'text'
    });
  }

  createAccount(username: string, password: string, confirmPassword: string, token?: string): Observable<any> {
    const data = { username, password, confirmPassword };
    return this.http.put(`${this.apiUrl}/create-account?token=${token}`, data);
  }
}