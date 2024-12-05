import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse, TokenValidationRequest, PasswordChangeRequest } from '../models/auth_models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/auth';
  private readonly tokenKey = 'auth_token';

  constructor(private readonly http: HttpClient) {}

  /**
   * Register a new user
   */
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

  /**
   * Simulated user registration
   */
  simulateRegister(email: string, password: string): Observable<string> {
    const simulatedToken = 'simulated-access-token';
    console.log(`Simulating registration for: ${email}`);
    return of(simulatedToken).pipe(
      delay(1000), // Simulate network latency
      map((token) => {
        this.saveToken(token);
        return token;
      })
    );
  }

  /**
   * Login user with email and password
   */
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

  /**
   * Simulated user login
   */
  simulateLogin(email: string, password: string): Observable<string> {
    console.log(`Simulating login for: ${email}`);

    const adminCredentials = {
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin',
    };

    const userCredentials = {
      email: 'user@user.com',
      password: 'user123',
      role: 'user',
    };

    let simulatedRole: string | null = null;

    if (email === adminCredentials.email && password === adminCredentials.password) {
      simulatedRole = adminCredentials.role;
    } else if (email === userCredentials.email && password === userCredentials.password) {
      simulatedRole = userCredentials.role;
    }

    if (simulatedRole) {
      const simulatedToken = `simulated-${simulatedRole}-token`;
      return of(simulatedToken).pipe(
        delay(1000), // Simulate network latency
        map((token) => {
          this.saveToken(token);
          return simulatedRole; // Return role for redirection
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

  /**
   * Validate if the current token is valid
   */
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

  /**
   * Change user password
   */
  changePassword(email: string, currentPassword: string, newPassword: string): Observable<void> {
    const url = `${this.apiUrl}/change_password`;
    const body: PasswordChangeRequest = { email, current_password: currentPassword, new_password: newPassword };

    return this.http.post<void>(url, body).pipe(
      catchError((error) => {
        throw new Error(`Password change failed: ${error.error.detail || error.message}`);
      })
    );
  }

  /**
   * Logout user by clearing token
   */
  logout(): void {
    this.clearToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get HTTP headers with Authorization token
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // Private helper methods
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
