import { Injectable } from '@angular/core';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatSession } from '../../chatbot-models/chatbot-session';
import { ChatbotApiService } from '../chatbot-api/chatbot-api.service';
import { SelectorOption } from '../../../../core/components/input-components/input-selector/input-selector.component';
import { WebRequestResult } from '../../../../core/models/enums';
import { environment } from '../../../../../environments/environment';

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
    this.createSession('-1', 'Example Session', 'user123', [
      { prompt: 'Hello, chatbot!', answer: 'Hello! How can I assist you today?' },
      { prompt: 'What’s the weather like?', answer: 'It’s sunny and 75°F right now.' },
      {
        prompt: 'Is it possible for a strawberry to be a banana?',
        answer: 'While it may seem odd, we can explore imaginative possibilities.',
      },
    ]);

    if (!environment.allowSidebar) {
      this.createEmptySession();
    }
  }

  private createSession(
    sessionId: string,
    title: string,
    userId: string,
    interactions: { prompt: string; answer: string }[]
  ): void {
    const session = new ChatSession(sessionId, title, userId);

    interactions.forEach(({ prompt, answer }) => {
      const userMessage = session.addUserMessage(prompt);
      session.addAssistantMessage(userMessage.id, answer);
    });

    this.sessions.push(session);
    this.currentSession = session;
  }

  createEmptySession(sessionTitle: string = 'New Chat Session'): void {
    const sessionId = this.generateSessionId();
    const session = new ChatSession(sessionId, sessionTitle, 'user123');
    this.sessions.push(session);
    this.switchSession(sessionId);
  }

  getSessions(): ChatSession[] {
    return this.sessions;
  }

  switchSession(sessionId: string): void {
    const session = this.sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      this.currentSession = session;
      this.chatbotEventService.onSessionChanged.emit();
    }
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

    const userMessage = this.currentSession.addUserMessage(promptMessage);
    this.chatbotEventService.onPromptSent.emit();

    this.chatbotApiService.requestUserChatCompletion(promptMessage, provider, model).subscribe({
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

  private generateSessionId(): string {
    return Math.random().toString(36).slice(2, 11);
  }

  handleFiles(files: File[]): void {
    console.log('[WIP] Implement: Handling Files:', files);
  }

  stopProcessing() {
    console.log('[WIP] Implement: Stop Processing');
  }
}
