import { Injectable, signal } from '@angular/core';
import { User } from '../features/user/models/userModels';
import { HttpHeaders } from '@angular/common/http';
import { ClientChatSession } from '../features/chatbot/chatbot-models/chatbot-client-session';
import { ChatSessionInteractionState, ChatSessionState } from '../features/chatbot/chatbot-models/chatbot-enums';

@Injectable({
  providedIn: 'root',
})
export class AppState {
  static readonly currentUser = signal<User | null>(null);
  static readonly authHeader = signal<HttpHeaders | null>(null);
  static readonly currentSessionID = signal<string | null>(null);
  static readonly currentChatSession = signal<ClientChatSession | null>(null);
  static readonly chatSessionState = signal<ChatSessionState>(ChatSessionState.NoSession);
  static readonly chatSessionInteractionState = signal<ChatSessionInteractionState>(ChatSessionInteractionState.Idle);


  // ------------------------------
  // Auth & Current User
  // ------------------------------
  static setCurrentUser(user: User): void {
    this.currentUser.set(user);
  }

  static setAuthHeader(token: string): void {
    this.authHeader.set(new HttpHeaders({ Authorization: `Bearer ${token}` }));
  }

  static setCurrentChatSession(session: ClientChatSession | null): void {
    this.currentChatSession.set(session);
    this.currentSessionID.set(session ? session.sessionId : null);
    this.updateChatSessionState(session ? ChatSessionState.ActiveSession : ChatSessionState.NoSession);
  }


  // ------------------------------
  // Chat Session State
  // ------------------------------
  static updateChatSessionState(state: ChatSessionState): void {
    this.chatSessionState.set(state);
  }

  static updateChatSessionInteractionState(state: ChatSessionInteractionState): void {
    this.chatSessionInteractionState.set(state);
  }


  // ------------------------------
  // Reset App State
  // ------------------------------
  static resetState(): void {
    this.currentUser.set(null);
    this.authHeader.set(null);
    this.currentSessionID.set(null);
    this.currentChatSession.set(null);
    this.updateChatSessionState(ChatSessionState.NoSession);
  }
}
