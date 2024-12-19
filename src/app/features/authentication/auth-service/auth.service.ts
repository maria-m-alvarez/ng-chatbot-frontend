import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse, TokenValidationRequest, PasswordChangeRequest } from '../models/auth_models';
import { environment } from '../../../../environments/environment'; // Update the path as needed

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/auth';
  private readonly tokenKey = 'auth_token';

  constructor(private readonly http: HttpClient) {}

  register(email: string, password: string): Observable<string> {
    const url = `${this.apiUrl}/register`;
    const body: LoginRequest = { email, password };

    return this.http.post<LoginResponse>(url, body).pipe(
      map((response) => {
        this.saveToken(response.access_token);
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
        return response.access_token;
      }),
      catchError((error) => {
        throw new Error(`Login failed: ${error.error.detail || error.message}`);
      })
    );
  }


  simulateLogin(email: string, password: string): Observable<string> {
    console.log(`Simulating login for: ${email}`);
    const userData = environment.simulateLogins[email]; // ignore this error. the compiler doesn't know about the environment.simulateLogins object

    if (userData && userData.password === password) {
      const simulatedRole = userData.role;
      const simulatedToken = `simulated-${simulatedRole}-token`;
      return of(simulatedToken).pipe(
        delay(1000), // Simulate network latency
        map((token) => {
          this.saveToken(token);
          return simulatedRole; // Return the role to help with any conditional redirects
        })
      );
    } else {
      // If credentials don't match the predefined simulated ones
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

    return this.http.post<void>(url, body).pipe(
      catchError((error) => {
        throw new Error(`Password change failed: ${error.error.detail || error.message}`);
      })
    );
  }

  logout(): void {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
