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

@Injectable({
  providedIn: 'root',
})
export class ChatbotSessionService {
  providers: SelectorOption[] = [];
  modelsByProvider: { [key: string]: SelectorOption[] } = {};

  currentSession!: ClientChatSession;
  sessions: ClientChatSession[] = [];

  constructor(
    private readonly eventService: EventService,
    private readonly chatbotEventService: ChatbotEventService,
    private readonly chatbotApiService: ChatbotApiService
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
  private initializeSessions(): void {
    this.fetchAllChatSessions();
    this.fetchLastAccessedChatSession();
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
        this.currentSession = this.transformSession(session);
        this.chatbotEventService.onSessionChanged.emit();
      },
      error: (error) => console.error('Error fetching last accessed session:', error),
    });
  }

  switchChatSession(sessionId: string | number): void {
    this.chatbotApiService.getSessionWithMessages(sessionId).subscribe({
      next: (chatSession) => {
        this.currentSession = this.transformSessionWithMessages(chatSession);
        this.chatbotEventService.onSessionChanged.emit();
      },
      error: (error) => {
        console.error('Error switching session:', error);
      },
    });
  }

  createChatSession(sessionName: string): void {
    if (!sessionName.trim()) {
      console.error('Session name cannot be empty.');
      return;
    }

    this.chatbotApiService.createSession(sessionName).subscribe({
      next: (newSession) => {
        const transformedSession = this.transformSession(newSession);
        this.sessions.push(transformedSession);
        this.currentSession = transformedSession;
        this.chatbotEventService.onSessionChanged.emit();
      },
      error: (error) => console.error('Error creating session:', error),
    });
  }

  createEmptyChatSession(sessionTitle: string = 'New Session'): void {
    this.createChatSession(sessionTitle);
  }

  // ------------------------------
  // ✉️ Chat Message Handling
  // ------------------------------
  sendChatMessageForCurrentChatSession(promptMessage: string): void {
    if (!this.currentSession) {
      console.warn('No current session found. Creating a new session...');
      this.createEmptyChatSession();
      return;
    }

    const userMessage = this.currentSession.addUserMessage(promptMessage);
    this.chatbotEventService.onPromptSent.emit();

    this.chatbotApiService
      .requestUserChatCompletion(promptMessage, 'azure_openai', 'Azure gpt-4o-mini', null, +this.currentSession.sessionId)
      .subscribe({
        next: (apiResponse) => {
          const assistantMessage = apiResponse.messages.find((msg) => msg.role === 'assistant');

          // Transform references into DocumentReference objects
          const metadata: ChatMessageMetadata = {
            documents: apiResponse.references?.map((ref: any) => ({
              doc_id: ref.doc_id ?? 0,
              doc_name: ref.doc_name ?? 'Unknown Document',
              doc_page: ref.doc_page ?? 1,
              doc_content: ref.doc_content ?? '',
            })) || [],
          };

          this.handleAssistantChatMessageResponse(userMessage.id, assistantMessage?.content || '', metadata);
          this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Success);
        },
        error: (error) => {
          console.error('Error from chatbot API:', error);
          this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Error);
        },
      });
  }

  handleAssistantChatMessageResponse(promptId: string, message: string, metadata: ChatMessageMetadata = {}): void {
    this.currentSession.addAssistantMessage(promptId, message, metadata);
    this.chatbotEventService.onPromptAnswerReceived.emit();
  }

  sendPromptResultFeedback(messageId: string, rating: number, comments?: string): void {
    if (!messageId || !rating) {
      console.error('Invalid messageId or rating.');
      return;
    }

    this.chatbotApiService.sendPromptResultFeedback(messageId, rating, comments).subscribe({
      next: (response) => this.chatbotEventService.onFeedbackSent.emit(response),
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
      session.project_configuration
    );
  }

  private transformSessionWithMessages(session: ChatSessionWithMessages): ClientChatSession {
    const clientSession = new ClientChatSession(
      session.id.toString(),
      session.name ?? 'Untitled',
      session.user?.toString() || 'Unknown User',
      session.project_configuration
    );
  
    clientSession.createdAt = new Date(session.created_at);
    clientSession.updatedAt = new Date(session.updated_at);
  
    clientSession.messages = session.messages.map((msg) => this.transformMessage(msg));
  
    return clientSession;
  }

  private transformMessage(message: ChatMessage): ClientChatMessage {
    const metadata: ChatMessageMetadata = {
      documents: message.references?.map(ref => ({
        doc_id: ref['Document'].doc_id,
      doc_name: ref['Document'].doc_name,
      doc_page: ref['Document'].doc_page,
      doc_content: ref['Document'].doc_page_content
      })) || [],
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
