import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/auth';
  private readonly tokenKey = 'auth_token';

  constructor(private readonly http: HttpClient) { }

  register(email: string, password: string): Observable<string> {
    const url = `${this.apiUrl}/register`;
    const body = { email, password };

    return this.http.post<{ access_token: string, token_type: string }>(url, body).pipe(
      map(response => {
        this.saveToken(response.access_token);
        return response.access_token;
      })
    );
  }

  simulateRegister(email: string, password: string): Observable<string> {
    const simulatedToken = 'simulated-access-token';
    console.log(`Simulating registration for: ${email}`);
    return of(simulatedToken).pipe(
      delay(1000), // Simulate network latency
      map(token => {
        this.saveToken(token);
        return token;
      })
    );
  }

  login(email: string, password: string): Observable<string> {
    const url = `${this.apiUrl}/login`;
    const body = { email, password };

    return this.http.post<{ access_token: string, token_type: string }>(url, body).pipe(
      map(response => {
        this.saveToken(response.access_token);
        return response.access_token;
      })
    );
  }

  simulateLogin(email: string, password: string): Observable<string> {
    console.log(`Simulating login for: ${email}`);

    const adminCredentials = {
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin'
    };

    const userCredentials = {
      email: 'user@user.com',
      password: 'user123',
      role: 'user'
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
        map(token => {
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
