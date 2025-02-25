import { Injectable } from '@angular/core';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatbotApiService } from '../chatbot-api/chatbot-api.service';
import { EventService } from '../../../../core/services/event-service/event.service';
import { WebRequestResult } from '../../../../core/models/enums';
import {
  ChatMessageMetadata,
  ChatMessage,
  ChatSession,
  ChatSessionWithMessages,
  DocumentReference,
} from '../../chatbot-models/chatbot-api-response-models';
import {
  ClientChatMessage,
  ClientChatSession,
  ClientChatMessageFeedback,
} from '../../chatbot-models/chatbot-client-session';
import { SelectorOption } from '../../../../core/components/input-components/input-selector/input-selector.component';
import { AppState } from '../../../../core/app-state';
import { ChatSessionInteractionState, ChatSessionState } from '../../chatbot-models/chatbot-enums';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LocalizationService } from '../../../../core/services/localization-service/localization.service';

@Injectable({
  providedIn: 'root',
})
export class ChatbotSessionService {
  providers: SelectorOption[] = [];
  modelsByProvider: { [key: string]: SelectorOption[] } = {};
  sessions: ClientChatSession[] = [];

  constructor(
    private readonly eventService: EventService,
    private readonly chatbotEventService: ChatbotEventService,
    private readonly chatbotApiService: ChatbotApiService,
    private readonly localizationService: LocalizationService
  ) {
    this.initializeEventListeners();
  }

  // ------------------------------
  // 🎯 Event Listeners
  // ------------------------------
  private initializeEventListeners(): void {
    this.eventService.onUserLoginEvt.subscribe(() => this.initializeSessions());
    this.chatbotEventService.onChatbotSettingsChanged.subscribe(() => this.initializeSessions());
    this.chatbotEventService.onRequestModelNames.subscribe(() => this.initializeSessions());
  }

  getProviderSelectorOptions(): SelectorOption[] {
    return this.providers;
  }

  getProviderModelSelectorOptions(provider: string): SelectorOption[] {
    return this.modelsByProvider[provider] || [];
  }

  // ------------------------------
  // 📌 Session Management
  // ------------------------------
  private setSessionState(session: ClientChatSession | null): void {
    if (!session) {
      AppState.updateChatSessionState(ChatSessionState.NoSession);
    } else if (session.messages.length === 0) {
      AppState.updateChatSessionState(ChatSessionState.NewSession);
    } else {
      AppState.updateChatSessionState(ChatSessionState.ActiveSession);
    }
  }

  private setInteractionState(state: ChatSessionInteractionState): void {
    AppState.updateChatSessionInteractionState(state);
  }

  private initializeSessions(): void {
    this.fetchAllChatSessions();
  }

  isDocumentSession(): boolean {
    const session = AppState.currentChatSession();
    return session?.hasFiles ?? false;
  }

  fetchAllChatSessions(): void {
    this.chatbotApiService.getAllSessions().subscribe({
      next: (sessions) => {
        console.log('Fetched chat sessions:', sessions);
        this.sessions = sessions.map((session) => this.transformSession(session));
        this.chatbotEventService.onSessionListUpdated.emit();
      },
      error: (error) => console.error('Error fetching chat sessions:', error),
    });
  }

  fetchLastAccessedChatSession(): void {
    this.chatbotApiService.getRecentlyAccessedSession().subscribe({
      next: (session) => {
        this.switchChatSession(session.id.toString());
        console.log('Fetched last accessed session:', session);
      },
      error: (error) => console.error('Error fetching last accessed session:', error),
    });
  }
  
  switchChatSession(sessionId: string | number): void {
    this.setInteractionState(ChatSessionInteractionState.Loading);
  
    this.chatbotApiService.getSessionWithMessages(sessionId).subscribe({
      next: (chatSession) => {
        const transformedSession = this.transformSessionWithMessages(chatSession);
        AppState.currentSessionID.set(sessionId.toString());
        AppState.currentChatSession.set(transformedSession);
  
        // Determine session state
        AppState.updateChatSessionState(transformedSession.messages.length > 0 
          ? ChatSessionState.ActiveSession 
          : ChatSessionState.NewSession);
  
        this.chatbotEventService.onSessionChanged.emit();
        this.setInteractionState(ChatSessionInteractionState.Idle);
      },
      error: (error) => {
        console.error('Error switching session:', error);
        this.setInteractionState(ChatSessionInteractionState.Error);
      },
    });
  }

  createChatSession(sessionName: string): void {
    if (!sessionName.trim()) {
      console.error('Session name cannot be empty.');
      return;
    }
  
    this.setInteractionState(ChatSessionInteractionState.Loading);
  
    this.chatbotApiService.createSession(sessionName).subscribe({
      next: (newSession) => {
        const transformedSession = this.transformSession(newSession);
        this.sessions.push(transformedSession);
        this.switchChatSession(newSession.id);
      },
      error: (error) => {
        console.error('Error creating session:', error);
        this.setInteractionState(ChatSessionInteractionState.Error);
      },
    });
  }

  createEmptyChatSession(sessionTitle: string = 'Nova Sessão'): void {
    this.createChatSession(sessionTitle);
  }

  createDocSessionWithFiles(sessionName: string, files: File[]): Observable<ChatSession> {
    if (!sessionName.trim()) {
      console.error('[createDocSessionWithFiles] Error: Session name cannot be empty');
      // Return an immediately failing observable
      return new Observable<ChatSession>((observer) => {
        observer.error('Session name cannot be empty');
      });
    }

    // 1) Indicate loading
    this.setInteractionState(ChatSessionInteractionState.Loading);

    // 2) Call API
    return this.chatbotApiService.createDocSessionWithFiles(sessionName, files).pipe(
      tap((newSession: ChatSession) => {
        console.log('[ChatbotSessionService] createDocSessionWithFiles => newSession', newSession);

        // 3) Transform the session -> ClientChatSession
        const transformedSession = this.transformSession(newSession);

        // 4) Push to local list of sessions
        this.sessions.push(transformedSession);

        // 5) Optionally switch to that session, or update state
        AppState.currentSessionID.set(newSession.id.toString());
        AppState.currentChatSession.set(transformedSession);
        // If the session has no messages => set 'NewSession', else 'ActiveSession'
        this.setSessionState(transformedSession);

        // 6) Set interaction to Idle
        this.setInteractionState(ChatSessionInteractionState.Idle);
      }),
      catchError((error) => {
        console.error('[ChatbotSessionService] createDocSessionWithFiles => error', error);
        this.setInteractionState(ChatSessionInteractionState.Error);
        throw error;
      })
    );
  }

  private createEmptyChatSessionAndSendMessage(promptMessage: string): void {
    this.setInteractionState(ChatSessionInteractionState.Loading);
  
    this.chatbotApiService.createSession('Nova Sessão').subscribe({
      next: (newSession) => {
        const transformedSession = this.transformSession(newSession);
        this.sessions.push(transformedSession);
        AppState.currentChatSession.set(transformedSession);
        AppState.currentSessionID.set(newSession.id.toString());
  
        this.setSessionState(transformedSession);
        this.sendChatMessageForCurrentChatSession(promptMessage);
      },
      error: (error) => {
        console.error('Error creating session:', error);
        this.setInteractionState(ChatSessionInteractionState.Error);
      },
    });
  }  

  renameSession(sessionId: string, newTitle: string): void {
    this.chatbotApiService.renameSession(sessionId, newTitle).subscribe({
      next: (response) => {
        const session = this.sessions.find(s => s.sessionId === sessionId);
        if (session) session.name = response.session.name ?? 'Untitled';
        this.chatbotEventService.onSessionListUpdated.emit();
      },
      error: (err) => console.error(`Error renaming session: ${err}`),
    });
  }
  
  deleteSession(sessionId: string): void {
    this.setInteractionState(ChatSessionInteractionState.Loading);
  
    this.chatbotApiService.softDeleteSession(sessionId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.sessionId !== sessionId);
        if (AppState.currentSessionID() === sessionId.toString()) {
          AppState.currentSessionID.set(null);
          AppState.currentChatSession.set(null);
          AppState.updateChatSessionState(ChatSessionState.NoSession);
        }
        this.chatbotEventService.onSessionListUpdated.emit();
        this.setInteractionState(ChatSessionInteractionState.Idle);
      },
      error: (err) => {
        console.error(`Error deleting session: ${err}`);
        this.setInteractionState(ChatSessionInteractionState.Error);
      },
    });
  }
  

  // ------------------------------
  // ✉️ Chat Message Handling
  // ------------------------------
  sendChatMessageForCurrentChatSession(promptMessage: string): void {
    let currentSession = AppState.currentChatSession();
  
    if (!currentSession) {
      console.warn('No current session found. Creating a new session...');
      this.createEmptyChatSessionAndSendMessage(promptMessage);
      return;
    }
  
    // Check if this is the first message in a new session
    const isFirstMessage = currentSession.messages.length === 0;
    const isNewSession = currentSession.name === this.localizationService.translate(this.localizationService.LocalizationKeys.NEW_SESSION) || currentSession.name === this.localizationService.translate(this.localizationService.LocalizationKeys.NEW_DOC_SESSION);
  
    // 1) Add local user message with placeholder ID
    const userMessage = currentSession.addUserMessage(promptMessage);
    AppState.currentChatSession.set(currentSession);
    this.setInteractionState(ChatSessionInteractionState.Loading);
  
    if (isFirstMessage) {
      AppState.updateChatSessionState(ChatSessionState.ActiveSession);
    }
  
    this.chatbotEventService.onPromptSent.emit();
  
    this.chatbotApiService
      .requestUserChatCompletion(promptMessage, 'azure_openai', 'Azure gpt-4o-mini', null, +currentSession.sessionId)
      .subscribe({
        next: (apiResponse) => {
          console.log('Chatbot API Response:', apiResponse);
  
          const serverUser = apiResponse.messages.find(m => m.role === 'user');
          const serverAssistant = apiResponse.messages.find(m => m.role === 'assistant');
  
          if (serverUser?.message_id != null) {
            userMessage.id = String(serverUser.message_id);
          }
  
          const metadata = {
            documents: apiResponse.references?.map((ref: any) => {
              const doc = ref?.Document;
              return doc
                ? {
                    doc_id: doc.doc_id ?? 0,
                    doc_name: doc.doc_name ?? 'Unknown Document',
                    doc_page: doc.doc_page ?? 1,
                    doc_content: doc.doc_page_content ?? '',
                  }
                : null;
            }).filter((doc): doc is DocumentReference => doc !== null) || [],
          };
  
          if (serverAssistant?.message_id != null) {
            const newAssistant = currentSession.addAssistantMessage(
              userMessage.id,
              serverAssistant.content || '',
              metadata
            );
            newAssistant.id = String(serverAssistant.message_id);
          }
  
          AppState.currentChatSession.set(currentSession);
          this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Success);
          this.setInteractionState(ChatSessionInteractionState.Idle);
  
          // Generate session name only after the first assistant response
          if (isFirstMessage && isNewSession) {
            console.log('Generating session name...');
            this.chatbotApiService.generateSessionName(+currentSession.sessionId).subscribe({
              next: (response) => {
                console.log(`Generated session name: ${response.session_name}`);
                this.renameSession(currentSession.sessionId, response.session_name);
              },
              error: (error) => console.error('Error generating session name:', error),
            });
          }
        },
        error: (error) => {
          console.error('Error from chatbot API:', error);
          this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Error);
          this.setInteractionState(ChatSessionInteractionState.Error);
        },
      });
  }

  sendAssistantMessageFeedback(messageId: string, rating: number, comments?: string): void {    
    if (!messageId || messageId == "-1" || !rating) {
      console.error('Invalid messageId or rating.');
      console.log('Sending feedback for message:', messageId, 'Rating:', rating, 'Comments:', comments);
      return;
    }

    this.chatbotApiService.sendPromptResultFeedback(messageId, rating, comments).subscribe({
      next: (response) => {
        console.log("Feedback sent:", response);
        this.chatbotEventService.onFeedbackSent.emit(response)
      },
      error: (error) => console.error('Error submitting feedback:', error),
    });
  }

  // ------------------------------
  // 🔄 Transform API Models to Client Models
  // ------------------------------
  private transformSession(session: ChatSession): ClientChatSession {
    return new ClientChatSession(
      session.id.toString(),
      session.name ?? 'Untitled',
      session.user?.toString() || 'Unknown User',
      session.has_files ?? false,
      session.project_configuration
    );
  }

  private transformSessionWithMessages(session: ChatSessionWithMessages): ClientChatSession {
    const clientSession = new ClientChatSession(
      session.id.toString(),
      session.name ?? 'Untitled',
      session.user?.toString() || 'Unknown User',
      session.has_files ?? false,
      session.project_configuration
    );

    clientSession.createdAt = new Date(session.created_at);
    clientSession.updatedAt = new Date(session.updated_at);
    clientSession.messages = session.messages.map(this.transformMessage);

    return clientSession;
  }

  private transformMessage(message: ChatMessage): ClientChatMessage {
    const metadata: ChatMessageMetadata = {
        documents: message.references?.map(ref => {
            const doc = ref?.['Document']; // Ensure we safely access Document property
            return doc
                ? {
                      doc_id: doc.doc_id,
                      doc_name: doc.doc_name,
                      doc_page: doc.doc_page,
                      doc_content: doc.doc_page_content
                  }
                : null;
        }).filter((doc): doc is DocumentReference => doc !== null) || [], // Remove null values
    };

    const feedback: ClientChatMessageFeedback | null = message.feedback
        ? {
              id: message.feedback.id ?? null,
              rating: message.feedback.rating ?? null,
              user_id: message.feedback.user_id ?? null,
              comments: message.feedback.comments ?? null,
          }
        : null;

    return new ClientChatMessage(
        message.id.toString(),
        message.role,
        message.content ?? '',
        metadata,
        new Date(message.created_at),
        message.request_tokens ?? null,
        message.response_tokens ?? null,
        message.total_tokens ?? null,
        message.retrieval_time ?? null,
        message.generation_time ?? null,
        feedback
    );
  }


  handleFiles(files: File[]): void {
    console.log('[WIP] Implement: Handling Files:', files);
  }

  stopProcessing(): void {
    console.log('[WIP] Implement: Stop Processing');
  }
}
