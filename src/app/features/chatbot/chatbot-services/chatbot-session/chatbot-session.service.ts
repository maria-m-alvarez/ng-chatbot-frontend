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
} from '../../chatbot-models/chatbot-api-response-models';
import {
  ClientChatMessage,
  ClientChatSession,
  ClientChatMessageFeedback,
} from '../../chatbot-models/chatbot-client-session';
import { SelectorOption } from '../../../../core/components/input-components/input-selector/input-selector.component';
import { AppState } from '../../../../core/app-state';
import { ChatSessionCreationState, ChatSessionInteractionState, ChatSessionState, creationOrder } from '../../chatbot-models/chatbot-enums';
import { catchError, finalize, map, tap } from 'rxjs/operators';
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
  private setSessionState(targetState : ChatSessionState): void {
    if (targetState === AppState.chatSessionState()) {
      console.warn('Session state is already set to the target state:', targetState);
      return;
    }

    if (AppState.activeChatSession() === null) {
      AppState.updateChatSessionState(ChatSessionState.NoSession);
      return;
    }

    switch (targetState) {
      case ChatSessionState.NoSession:
        break;
      case ChatSessionState.Creating:
        this.setSessionCreationState(ChatSessionCreationState.WaitingFirstMessage);
        break;
      case ChatSessionState.Active:
        break;
      default:
        console.warn('Unknown session state:', targetState);
        AppState.updateChatSessionState(ChatSessionState.NoSession);
        break;
    }

    // If the target state is not 'Creating', reset the session creation state to 'Idle'
    if (targetState != ChatSessionState.Creating) {
      this.setSessionCreationState(ChatSessionCreationState.Idle);
    }

    AppState.updateChatSessionState(targetState);
  }

  private setSessionCreationState(state: ChatSessionCreationState): void {
    const currentState = AppState.chatSessionCreationState() ?? ChatSessionCreationState.Idle;
  
    // Always allow transitions to or from Error
    if (
      state === ChatSessionCreationState.Error || currentState === ChatSessionCreationState.Error
    ) {
      AppState.updateChatSessionCreationState(state);
      return;
    }
  
    AppState.updateChatSessionCreationState(state);
  }
  

  private setInteractionState(state: ChatSessionInteractionState): void {
    AppState.updateChatSessionInteractionState(state);
  }

  private initializeSessions(): void {
    this.fetchAllChatSessions();
  }

  private setActiveSession(session: ClientChatSession | null): void {
    AppState.activeChatSession.set(session);

    this.setSessionCreationState(ChatSessionCreationState.Idle);
    this.setInteractionState(ChatSessionInteractionState.Idle);

    if (!session) {
      this.setSessionState(ChatSessionState.NoSession);
      this.setSessionCreationState(ChatSessionCreationState.WaitingFirstMessage);
      return;
    } else {
      this.setSessionState(ChatSessionState.Active);
    }

    this.chatbotEventService.onSessionChanged.emit();
  }

  isDocumentSession(): boolean {
    const session = AppState.activeChatSession();
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
  
  switchChatSession(sessionId: string | number): void {
    // 1) Check if the session is already active
    const currentSession = AppState.activeChatSession();
    if (currentSession && currentSession.sessionId === sessionId.toString()) {
      console.warn('Session is already active:', sessionId);
      return;
    }
  
    console.log(`[SwitchSession] Switching to session ID: ${sessionId}`);
  
    // 2) Set session and interaction states to transitioning/loading
    this.setSessionState(ChatSessionState.Transitioning);
    this.setInteractionState(ChatSessionInteractionState.Loading);
    console.log('[SwitchSession] State set to Transitioning and interaction set to Loading.');
  
    // 3) Fetch session from API
    this.chatbotApiService.getSessionWithMessages(sessionId).subscribe({
      next: (chatSession) => {
        console.log('[SwitchSession] Session fetched from API:', chatSession);
  
        // 4) Transform and set the session early
        const transformedSession = this.transformSessionWithMessages(chatSession);
        AppState.activeChatSession.set(transformedSession);
        console.log('[SwitchSession] Transformed and set active session:', transformedSession);
  
        // 5) Now determine the session state based on message presence
        if (transformedSession.messages.length > 0) {
          this.setSessionState(ChatSessionState.Active);
          this.setSessionCreationState(ChatSessionCreationState.Created);
          console.log('[SwitchSession] Session is active with messages.');
        } else {
          this.setSessionState(ChatSessionState.Creating);
          this.setSessionCreationState(ChatSessionCreationState.WaitingFirstMessageResponse);
          console.log('[SwitchSession] Session is new. Waiting for first message response.');
        }
  
        // 6) Emit change and mark interaction complete
        this.chatbotEventService.onSessionChanged.emit();
        this.setInteractionState(ChatSessionInteractionState.Idle);
        console.log('[SwitchSession] Session switch complete. Interaction state set to Idle.');
      },
      error: (error) => {
        console.error('[SwitchSession] Error switching session:', error);
        this.setInteractionState(ChatSessionInteractionState.Error);
      },
    });
  }
  
  

  startCreationOfChatSession(): void {
    // 1) Check if the session is in a creatable state
    const currentState = AppState.chatSessionCreationState() ?? ChatSessionCreationState.Idle;
    if (
        currentState == ChatSessionCreationState.Creating ||
        currentState == ChatSessionCreationState.WaitingFirstMessageResponse ||
        currentState == ChatSessionCreationState.Renaming
    ) {
      console.warn('Session is not in a creatable state:', AppState.chatSessionCreationState());
      return;
    }

    // 2) Update relevant states
    this.setActiveSession(null); // Clear the active session
  }

  createChatSession(sessionName: string): Observable<ClientChatSession> {
    if (!sessionName.trim()) {
      console.error('Session name cannot be empty.');
      return new Observable<ClientChatSession>((observer) => {
        observer.error(new Error('Session name cannot be empty.'));
      });
    }
  
    this.setSessionCreationState(ChatSessionCreationState.Creating);
    this.setInteractionState(ChatSessionInteractionState.Loading);
  
    return this.chatbotApiService.createSession(sessionName).pipe(
      map((newSession: ChatSession) => {
        const transformedSession = this.transformSession(newSession);
        this.sessions.push(transformedSession);
        console.log('[createChatSession] Session created and pushed to local cache.', transformedSession);
        return transformedSession; // ✅ emit ClientChatSession
      }),
      catchError((error) => {
        console.error('[createChatSession] Error creating session:', error);
        this.setInteractionState(ChatSessionInteractionState.Error);
        throw error;
      }),
      finalize(() => {
        this.setInteractionState(ChatSessionInteractionState.Idle);
      })
    );
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

        // 5) Update the active session
        this.setActiveSession(transformedSession);
      }),
      catchError((error) => {
        console.error('[ChatbotSessionService] createDocSessionWithFiles => error', error);
        this.setInteractionState(ChatSessionInteractionState.Error);
        throw error;
      })
    );
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

  renameSessionBasedOnFirstMessage(sessionId: string | number): void {
    this.chatbotApiService.renameSessionBasedOnFirstMessage(sessionId)
      .subscribe({
        next: (response) => {
          console.log(`[renameSessionBasedOnFirstMessage] Session renamed to: ${response.session.name}`);
  
          // 1) Update local sessions array
          const idx = this.sessions.findIndex((s) => s.sessionId === sessionId.toString());
          if (idx !== -1) {
            this.sessions[idx].name = response.session.name ?? 'Untitled';
          }
  
          // 2) Update the active session if it matches
          const activeSession = AppState.activeChatSession();
          if (activeSession && activeSession.sessionId === sessionId.toString()) {
            activeSession.name = response.session.name ?? 'Untitled';
            this.setActiveSession(activeSession);
          }
  
          // 3) Emit the session list update
          this.chatbotEventService.onSessionListUpdated.emit();
        },
        error: (err) => {
          console.error('[renameSessionBasedOnFirstMessage] Error:', err);
        },
      });
  }
  
  
  deleteSession(sessionId: string): void {
    this.setInteractionState(ChatSessionInteractionState.Loading);
  
    this.chatbotApiService.softDeleteSession(sessionId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.sessionId !== sessionId);
        if (AppState.activeChatSession()?.sessionId === sessionId.toString()) {
          AppState.activeChatSession.set(null);
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
  trySendChatMessageForCurrentChatSession(promptMessage: string): void {
    console.log('[Chat] Attempting to send user prompt...');
  
    // 1) Check if it's a new session (first message in a new session)
    if (
      AppState.activeChatSession() == null ||
      AppState.chatSessionCreationState() === ChatSessionCreationState.WaitingFirstMessage
    ) {
      console.log('[Chat] No active session yet. Creating session, sending first message, and triggering rename...');
      this.createSessionSendChatMessageAndRename(promptMessage);
      return;
    }
  
    // 2) Send the message to the current session
    console.log('[Chat] Active session already exists. Sending prompt directly to chatbot...');
    this.sendChatMessageForCurrentChatSession(promptMessage);
  }
  

  // not preferred (callback hell), but works great
  createSessionSendChatMessageAndRename(promptMessage: string): void {
    console.log('[createSessionSendChatMessageAndRename] Creating new session with placeholder name...');
  
    // 1) Create new session (placeholder name: "New Session")
    this.createChatSession(
      this.localizationService.translate(this.localizationService.LocalizationKeys.NEW_SESSION)
    ).subscribe({
      next: (newClientSession) => {
        console.log('[createSessionSendChatMessageAndRename] Session created. Setting active...');
        
        // 2) Set the newly created session as active
        this.setActiveSession(newClientSession);
  
        console.log('[createSessionSendChatMessageAndRename] Sending first user prompt...');
        // 3) Send the user’s prompt to the now-active session
        this.sendChatMessageForCurrentChatSession(promptMessage, () => {
          console.log('[createSessionSendChatMessageAndRename] First message sent. Renaming session...');
  
          // 4) Rename session based on first message
          this.renameSessionBasedOnFirstMessage(newClientSession.sessionId);
        });
      },
      error: (err) => {
        console.error('[createSessionSendChatMessageAndRename] Failed to create session:', err);
        this.setInteractionState(ChatSessionInteractionState.Error);
      },
    });
  }
  


  sendChatMessageForCurrentChatSession(promptMessage: string, onComplete?: () => void): void {
    const currentSession = AppState.activeChatSession();
    if (!currentSession) {
      console.error('[sendChatMessageForCurrentChatSession] No active session found. Cannot send message.');
      return;
    }
  
    console.log('[sendChatMessageForCurrentChatSession] Sending prompt to session:', currentSession.sessionId);
  
    // 1) Add local user message with placeholder ID
    const userMessage = currentSession.addUserMessage(promptMessage);
    AppState.activeChatSession.set(currentSession);
  
    this.setInteractionState(ChatSessionInteractionState.Loading);
    this.chatbotEventService.onPromptSent.emit();
  
    // 2) Call chatbot API
    this.chatbotApiService
        .requestUserChatCompletion(promptMessage, 'azure_openai', 'Azure gpt-4o-mini', null, +currentSession.sessionId)
        .subscribe({
          next: (apiResponse) => {
            console.log('[sendChatMessageForCurrentChatSession] Chatbot API Response:', apiResponse);
  
            const serverUser = apiResponse.messages.find((m) => m.role === 'user');
            const serverAssistant = apiResponse.messages.find((m) => m.role === 'assistant');
  
            if (serverUser?.message_id != null) {
              userMessage.id = String(serverUser.message_id);
            }
  
            const metadata = {
              documents: apiResponse.references?.map((ref) => ({
                doc_id: ref['doc_id'] ?? 0,
                doc_name: ref['doc_name'] ?? 'Unknown Document',
                doc_page: ref['doc_page'] ?? 1,
                doc_content: ref['content'] ?? '',
              })) || [],
            };
  
            if (serverAssistant?.message_id != null) {
              const newAssistant = currentSession.addAssistantMessage(
                userMessage.id,
                serverAssistant.content || '',
                metadata
              );
              newAssistant.id = String(serverAssistant.message_id);
            }
  
            AppState.activeChatSession.set(currentSession);
            this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Success);
            this.setInteractionState(ChatSessionInteractionState.Idle);
  
            if (onComplete) {
              onComplete();
            }
          },
          error: (error) => {
            console.error('[sendChatMessageForCurrentChatSession] Error from chatbot API:', error);
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
    console.log('Transforming message:', message);

    const metadata: ChatMessageMetadata = {
        documents: message.references?.map(ref => ({
            doc_id: ref['doc_id'] ?? 0,
            doc_name: ref['doc_name'] ?? 'Unknown Document',
            doc_page: ref['doc_page'] ?? 1,
            doc_content: ref['content'] ?? '',
        })) || [],
    };

    console.log('Transformed metadata:', metadata);

    const feedback: ClientChatMessageFeedback | null = message.feedback
        ? {
              id: message.feedback.id ?? null,
              rating: message.feedback.rating ?? null,
              user_id: message.feedback.user_id ?? null,
              comments: message.feedback.comments ?? null,
          }
        : null;

    console.log('Transformed feedback:', feedback);

    const transformedMessage = new ClientChatMessage(
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

    console.log('Transformed message:', transformedMessage);

    return transformedMessage;
  }

  handleFiles(files: File[]): void {
    console.log('[WIP] Implement: Handling Files:', files);
  }

  stopProcessing(): void {
    console.log('[WIP] Implement: Stop Processing');
  }
}
