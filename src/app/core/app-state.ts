import { Injectable, signal } from '@angular/core';
import { User } from '../features/user/models/userModels';
import { HttpHeaders } from '@angular/common/http';
import { ClientChatSession } from '../features/chatbot/chatbot-models/chatbot-client-session';
import { ChatSessionCreationState, ChatSessionInteractionState, ChatSessionState } from '../features/chatbot/chatbot-models/chatbot-enums';

@Injectable({
  providedIn: 'root',
})
export class AppState {
  // User & Auth
  // ------------------------------
  static readonly currentUser = signal<User | null>(null);
  static readonly authHeader = signal<HttpHeaders | null>(null);

  // Chat Session
  // ------------------------------
  static readonly activeChatSession = signal<ClientChatSession | null>(null);
  static readonly chatSessionState = signal<ChatSessionState>(ChatSessionState.NoSession);
  static readonly chatSessionCreationState = signal<ChatSessionCreationState>(ChatSessionCreationState.Idle);
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
    this.activeChatSession.set(session);
    this.updateChatSessionState(session ? ChatSessionState.Active : ChatSessionState.NoSession);
  }

  static isDocumentSession(): boolean {
    const session = AppState.activeChatSession();
    console.log(session);
    return session?.hasFiles ?? false;
  }


  // ------------------------------
  // Chat Session State
  // ------------------------------
  static activeChatSessionId(): string | null {
    const session = this.activeChatSession();
    return session ? session.sessionId : null;
  }

  static updateChatSessionState(state: ChatSessionState): void {
    this.chatSessionState.set(state);
  }

  static updateChatSessionCreationState(state: ChatSessionCreationState): void {
    this.chatSessionCreationState.set(state);
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
    this.activeChatSession.set(null);
    this.updateChatSessionState(ChatSessionState.NoSession);
  }
}
