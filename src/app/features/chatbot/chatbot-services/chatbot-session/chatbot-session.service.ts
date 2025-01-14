import { Injectable } from '@angular/core';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatMessage, ChatSession } from '../../chatbot-models/chatbot-session';
import { ChatbotApiService } from '../chatbot-api/chatbot-api.service';
import { SelectorOption } from '../../../../core/components/input-components/input-selector/input-selector.component';
import { WebRequestResult } from '../../../../core/models/enums';
import { environment } from '../../../../../environments/environment';
import { AppState } from '../../../../core/app-state';
import { ChatMessageMetadata } from '../../chatbot-models/chatbot-api-models';

@Injectable({
  providedIn: 'root',
})
export class ChatbotSessionService {
  currentSession!: ChatSession;
  sessions: ChatSession[] = [];
  providers: SelectorOption[] = [];
  modelsByProvider: { [key: string]: SelectorOption[] } = {};
  selectedProvider: SelectorOption | null = null;
  selectedModel: SelectorOption | null = null;

  constructor(
    private readonly appState: AppState,
    private readonly chatbotEventService: ChatbotEventService,
    private readonly chatbotApiService: ChatbotApiService
  ) {
    this.initializeSessions();
    this.initializeEventListeners();
    this.getProvidersAndTheirModelNames();
  }

  private initializeEventListeners(): void {
    this.chatbotEventService.onChatbotSettingsChanged.subscribe(() => {
      this.getProvidersAndTheirModelNames();
    });

    this.chatbotEventService.onRequestModelNames.subscribe(() => {
      this.getProvidersAndTheirModelNames();
    });
  }

  private getProvidersAndTheirModelNames(): void {
    this.providers = [new SelectorOption(1, 'azure_openai')];
    this.modelsByProvider = {
      azure_openai: [new SelectorOption(1, 'Azure GPT-3.5')],
    };
    this.selectInitialModel();
  }

  private selectInitialModel(): void {
    this.selectedProvider = this.providers.find((provider) => provider.value === 'azure_openai') ?? null;
    this.selectedModel =
      this.modelsByProvider['azure_openai']?.find((model) => model.value === 'Azure GPT-3.5') ?? null;

    this.chatbotEventService.onChatbotProviderChanged.emit(this.selectedProvider?.value ?? '');
    this.chatbotEventService.onChatbotModelNameChanged.emit(this.selectedModel?.value ?? '');

    console.log('Selected Provider:', this.selectedProvider);
    console.log('Selected Model:', this.selectedModel);
  }

  getProviderSelectorOptions(): SelectorOption[] {
    return this.providers;
  }

  getProviderModelSelectorOptions(provider: string): SelectorOption[] {
    return this.modelsByProvider[provider] || [];
  }

  private initializeSessions(): void {
    if (!environment.allowSidebar) {
      this.createEmptySession();
    }
  }

  private createSession(sessionName: string): void {
    if (!sessionName.trim()) {
      console.error('Session name cannot be empty.');
      return;
    }
  
    this.chatbotApiService.createSession(sessionName).subscribe({
      next: (newSession) => {
        // Add the new session to the sessions list
        this.sessions.push(newSession);
  
        console.log('Session created successfully:', this.currentSession);
  
        // Emit an event to notify other components
        this.switchSession(newSession.sessionId);
      },
      error: (error) => {
        if (error.status === 422) {
          console.error('Invalid session name:', error.error.detail);
        } else {
          console.error('Error creating session:', error);
        }
      },
    });
  }
  

  createEmptySession(sessionTitle: string = 'Nova Sessão'): void {
    this.createSession(sessionTitle);
  }
  

  getSessions(): ChatSession[] {
    return this.sessions;
  }

  fetchSessions(): void {
    this.chatbotApiService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions = this.transformSessions(sessions);
        if (this.sessions.length > 0) {
          this.currentSession = this.sessions[0];
        }
        this.chatbotEventService.onSessionListUpdated.emit();
      },
      error: (error) => {
        console.error('Error fetching chat sessions:', error);
      },
    });
  }

  switchSession(sessionId: string): void {
    this.chatbotApiService.getSessionWithMessages(+sessionId).subscribe({
      next: (response) => {
        this.currentSession = this.transformSessionWithMessages(response);
        this.chatbotEventService.onSessionChanged.emit();
        console.log('Switched to session:', this.currentSession);
      },
      error: (error) => {
        console.error('Error switching session:', error);
      },
    });
  }

  handleAssistantResponse(
    promptId: string,
    message: string,
    metadata: { documents?: { doc_id: number; doc_name: string; doc_page: number; doc_content: string }[] } = {}
  ): void {
    const msg = this.currentSession.addAssistantMessage(promptId, message, metadata);
    this.chatbotEventService.onPromptAnswerReceived.emit();

    console.log('Assistant Response with Metadata:', msg);
  }

  sendMessage(promptMessage: string): void {
    const { value: provider } = this.selectedProvider ?? {};
    const { value: model } = this.selectedModel ?? {};
  
    if (!provider || !model) {
      console.error('Provider or model is not selected.');
      return;
    }
  
    // Check if a current session exists; if not, create a new session
    if (!this.currentSession) {
      console.warn('No current session found. Creating a new session...');
      this.createEmptySession();
      return;
    }
  
    const userMessage = this.currentSession.addUserMessage(promptMessage);
    this.chatbotEventService.onPromptSent.emit();
  
    // Send the message to the API
    this.chatbotApiService
      .requestUserChatCompletion(promptMessage, provider, model, null, +this.currentSession.sessionId)
      .subscribe({
        next: (apiResponse) => {
          const assistantMessageContent =
            apiResponse?.messages.find((msg) => msg.role === 'assistant')?.content ?? '';
          const metadata = apiResponse?.references
            ? {
                documents: apiResponse.references.map((ref: any) => ({
                  doc_id: ref.Document.doc_id || 0,
                  doc_name: ref.Document.doc_name || '',
                  doc_page: ref.Document.doc_page || 0,
                  doc_content: ref.Document.doc_content || '',
                })),
              }
            : {};
          this.handleAssistantResponse(userMessage.id, assistantMessageContent, metadata);
          this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Success);
        },
        error: (error) => {
          console.error('Error from chatbot API:', error);
          this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Error);
        },
      });
  }

  handleFiles(files: File[]): void {
    console.log('[WIP] Implement: Handling Files:', files);
  }

  stopProcessing() {
    console.log('[WIP] Implement: Stop Processing');
  }

  private transformSessions(sessions: any[]): ChatSession[] {
    return sessions.map((session) => {
      const chatSession = new ChatSession(
        session.id.toString(),
        session.name,
        session.user
      );
      chatSession.createdAt = new Date(session.created_at);
      chatSession.updatedAt = new Date(session.updated_at);
  
      // Process messages with metadata, including documents
      if (session.messages) {
        chatSession.messages = session.messages.map((message: any) =>
          this.transformMessage(message)
        );
      }
  
      return chatSession;
    });
  }
  
  private transformSessionWithMessages(sessionData: any): ChatSession {
    const chatSession = new ChatSession(
      sessionData.session.id.toString(),
      sessionData.session.name,
      sessionData.session.user
    );
    chatSession.createdAt = new Date(sessionData.session.created_at);
    chatSession.updatedAt = new Date(sessionData.session.updated_at);
  
    // Process messages with metadata, including documents
    if (sessionData.messages) {
      chatSession.messages = sessionData.messages.map((message: any) =>
        this.transformMessage(message)
      );
    }
  
    return chatSession;
  }
  
  private transformMessage(message: any): ChatMessage {
    // Ensure document references are extracted correctly
    const metadata: ChatMessageMetadata = {
      documents: message.references?.map((ref: any) => ({
        doc_id: ref.Document.doc_id,
        doc_name: ref.Document.doc_name,
        doc_page: ref.Document.doc_page,
        doc_content: ref.Document.doc_page_content,
      })) || [],
    };
  
    return new ChatMessage(
      message.id.toString(),
      message.role,
      message.content,
      metadata
    );
  }
}
