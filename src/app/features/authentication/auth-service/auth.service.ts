import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse, TokenValidationRequest, PasswordChangeRequest } from '../models/auth_models';
import { environment } from '../../../../environments/environment'; // Update the path as needed
import { HostService } from '../../../core/services/host-service/host.service';
import { AppState } from '../../../core/app-state';
import { EventService } from '../../../core/services/event-service/event.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl: string;
  private readonly tokenKey = 'auth_token';
  private authHeaders: HttpHeaders = new HttpHeaders();

  constructor(
    private readonly eventService: EventService,
    private readonly http: HttpClient,
    private readonly hostService: HostService,
    private readonly appState: AppState
  ) {
    this.apiUrl = `${this.hostService.getHostBaseURL()}/auth`;
  
    const token = this.getToken();
    if (token) {
      this.updateAuthHeaders(token);
      this.updateAppStateFromToken(token);
    }
  }
  

  get headers(): HttpHeaders {
    const token = this.getToken(); // Retrieve the token from localStorage
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }), // Add Authorization only if token exists
    });
    return headers;
  }
  
  

  register(email: string, password: string): Observable<string> {
    const url = `${this.apiUrl}/register`;
    const body: LoginRequest = { email, password };

    return this.http.post<LoginResponse>(url, body).pipe(
      map((response) => {
        this.saveToken(response.access_token);
        this.updateAppStateFromToken(response.access_token, { email });
        return response.access_token;
      }),
      catchError((error) => {
        throw new Error(`Registration failed: ${error.error.detail || error.message}`);
      })
    );
  }

  simulateRegister(email: string, password: string): Observable<string> {
    const simulatedToken = 'simulated-access-token';
    console.log(`Simulating registration for: ${email}`);
    return of(simulatedToken).pipe(
      delay(1000), 
      map((token) => {
        this.saveToken(token);
        return token;
      })
    );
  }

  login(email: string, password: string): Observable<string> {
    const url = `${this.apiUrl}/login`;
    const body: LoginRequest = { email, password };

    return this.http.post<LoginResponse>(url, body).pipe(
      map((response) => {
        this.saveToken(response.access_token);
        this.updateAppStateFromToken(response.access_token, { email });
        console.log(`Logged response: ${response.access_token} ${response.token_type}`);
        return response.access_token;
      }),
      catchError((error) => {
        throw new Error(`Login failed: ${error.error.detail || error.message}`);
      })
    );
  }

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

  changePassword(email: string, currentPassword: string, newPassword: string): Observable<void> {
    const url = `${this.apiUrl}/change_password`;
    const body: PasswordChangeRequest = { email, current_password: currentPassword, new_password: newPassword };

    return this.http.post<void>(url, body, { headers: this.headers }).pipe(
      catchError((error) => {
        throw new Error(`Password change failed: ${error.error.detail || error.message}`);
      })
    );
  }

  logout(): void {
    this.clearToken();
    this.appState.resetState();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.updateAuthHeaders(token);
    this.updateAppStateFromToken(token);
  }

  private getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token;
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.authHeaders = new HttpHeaders(); // reset headers
    this.appState.authHeader = null;
    this.appState.currentUser = null;
  }

  private updateAuthHeaders(token: string): void {
    this.authHeaders = new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private updateAppStateFromToken(token: string, userInfo?: Partial<{ email: string }>): void {
    this.appState.setAuthHeader(token); // Set authHeader as HttpHeaders
    if (userInfo?.email) {
      this.appState.currentUser = {
        id: Date.now(),
        name: userInfo.email.split('@')[0],
        email: userInfo.email,
      };
    }
  }  
}
