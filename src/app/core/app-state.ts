import { Injectable } from '@angular/core';
import { User } from '../features/user/models/userModels';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root', // Makes it a singleton service available throughout the app
})
export class AppState {
  // Current logged-in user details
  currentUser: User | null = null;

  // Authentication header for API requests
  authHeader: HttpHeaders | null = null;

  // Current session ID
  currentSessionID: string | null = null;

  // Set current user details
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  // Update authentication header
  setAuthHeader(token: string): void {
    this.authHeader = new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Set the current session ID
  setSessionID(sessionID: string): void {
    this.currentSessionID = sessionID;
  }
  
  // Reset application state
  resetState(): void {
    this.currentUser = null;
    this.authHeader = null;
    this.currentSessionID = null;
  }
}
