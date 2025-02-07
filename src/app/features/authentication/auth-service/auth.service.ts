import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import {
  LoginRequest,
  LoginResponse,
  TokenValidationRequest,
  PasswordChangeRequest,
} from '../models/auth_models';
import { environment } from '../../../../environments/environment';
import { HostService } from '../../../core/services/host-service/host.service';
import { EventService } from '../../../core/services/event-service/event.service';
import { AppState } from '../../../core/app-state';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl: string;
  private readonly tokenKey = 'auth_token';

  constructor(
    private readonly eventService: EventService,
    private readonly http: HttpClient,
    private readonly hostService: HostService
  ) {
    this.apiUrl = `${this.hostService.getHostBaseURL()}/auth`;

    const token = this.getToken();
    if (token) {
      this.updateAuthHeaders(token);
      this.updateAppStateFromToken(token);
    }
  }

  get headers(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  getJsonHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers: { [key: string]: string } = { 'Content-Type': 'application/json' };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  getMultipartHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers: { [key: string]: string } = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  isLoggedIn(): boolean {
    return AppState.currentUser() !== null;
  }

  isTokenExpired(): boolean {
    const authHeader = AppState.authHeader();
    if (!authHeader) return true;

    const token = authHeader.get('Authorization')?.split('Bearer ')[1];
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime; // Expired if `exp` is in the past
    } catch (error) {
      return true; // Treat as expired if decoding fails
    }
  }

  // Login
  login(email: string, password: string): Observable<string> {
    const url = `${this.apiUrl}/login`;
    const body: LoginRequest = { email, password };

    return this.http.post<LoginResponse>(url, body).pipe(
      map((response) => {
        this.saveToken(response.access_token);
        this.updateAppStateFromResponse(response);
        return response.access_token;
      }),
      catchError((error) => {
        throw new Error(`Login failed: ${error.error.detail || error.message}`);
      })
    );
  }

  // Simulated login
  simulateLogin(email: string, password: string): Observable<string> {
    console.log(`Simulating login for: ${email}`);
    const userData = environment.simulateLogins[email];

    if (userData && userData.password === password) {
      const simulatedRole = userData.role;
      const simulatedToken = `simulated-${simulatedRole}-token`;

      return of(simulatedToken).pipe(
        delay(1000),
        map((token) => {
          this.saveToken(token);
          this.updateAppStateFromSimulation(email, simulatedRole);
          return simulatedRole;
        })
      );
    } else {
      return of('').pipe(
        delay(1000),
        map(() => {
          throw new Error('Invalid credentials');
        })
      );
    }
  }

  // Logout
  logout(): void {
    this.clearToken();
    AppState.resetState();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Register
  register(email: string, password: string): Observable<string> {
    const url = `${this.apiUrl}/register`;
    const body: LoginRequest = { email, password };

    return this.http.post<LoginResponse>(url, body).pipe(
      map((response) => {
        this.saveToken(response.access_token);
        this.updateAppStateFromResponse(response);
        return response.access_token;
      }),
      catchError((error) => {
        throw new Error(`Registration failed: ${error.error.detail || error.message}`);
      })
    );
  }

  // Simulated registration
  simulateRegister(email: string, password: string): Observable<string> {
    const simulatedToken = 'simulated-access-token';
    console.log(`Simulating registration for: ${email}`);

    return of(simulatedToken).pipe(
      delay(1000),
      map((token) => {
        this.saveToken(token);
        this.updateAppStateFromSimulation(email, 'user');
        return token;
      })
    );
  }

  // Password Change
  changePassword(email: string, currentPassword: string, newPassword: string): Observable<void> {
    const url = `${this.apiUrl}/change_password`;
    const body: PasswordChangeRequest = { email, current_password: currentPassword, new_password: newPassword };

    return this.http.post<void>(url, body, { headers: this.headers }).pipe(
      catchError((error) => {
        throw new Error(`Password change failed: ${error.error.detail || error.message}`);
      })
    );
  }

  // Token Validation
  validateToken(): Observable<boolean> {
    const url = `${this.apiUrl}/validate_token`;
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    const body: TokenValidationRequest = {
      access_token: token,
      token_type: 'Bearer',
    };

    return this.http.post<boolean>(url, body).pipe(
      catchError((error) => {
        console.error(`Token validation failed: ${error.error.detail || error.message}`);
        return of(false);
      })
    );
  }

  // Local Token Management
  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.updateAuthHeaders(token);
    this.updateAppStateFromToken(token);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    AppState.authHeader.set(null);
    AppState.currentUser.set(null);
  }

  private updateAuthHeaders(token: string): void {
    AppState.setAuthHeader(token);
  }

  // Update AppState from API response
  private updateAppStateFromResponse(response: LoginResponse): void {
    const user = {
      id: response.user_id,
      name: response.username,
      email: response.user_email,
    };

    AppState.setCurrentUser(user);
    AppState.setAuthHeader(response.access_token);
  }

  // Update AppState from token
  private updateAppStateFromToken(token: string): void {
    AppState.setAuthHeader(token);
  }

  // Update AppState for simulated login/register
  private updateAppStateFromSimulation(email: string, role: string): void {
    const user = {
      id: Date.now(),
      name: email.split('@')[0],
      email: email,
    };

    AppState.setCurrentUser(user);
    AppState.setAuthHeader(`simulated-${role}-token`);
  }
}
