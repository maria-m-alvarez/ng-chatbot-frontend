import { Injectable } from '@angular/core';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatSession } from '../../chatbot-models/chatbot-session';
import { ChatbotApiService } from '../chatbot-api/chatbot-api.service';
import { SelectorOption } from '../../../../core/components/input-components/input-selector/input-selector.component';
import { WebRequestResult } from '../../../../core/models/enums';
import { forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatbotSessionService {
  currentSession!: ChatSession;
  sessions: ChatSession[] = [];
  providers: string[] = [];
  modelsByProvider: { [key: string]: SelectorOption[] } = {};
  selectedProvider: string = '';
  selectedModel: string = '';

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
    this.chatbotApiService.getAllProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
        const modelRequests = providers.map((provider) =>
          this.chatbotApiService.getAllModelsByProvider(provider).pipe(
            map((response) => ({
              provider,
              models: response.models.map((model: { name: string }, index: number) => ({
                id: index + 1,
                value: model.name,
              })),
            }))
          )
        );

        forkJoin(modelRequests).subscribe({
          next: (responses) => {
            responses.forEach(({ provider, models }) => {
              this.modelsByProvider[provider] = models;
            });
            this.selectInitialModel();
          },
          error: (error) => {
            console.error('Error fetching models for providers:', error);
          },
        });
      },
      error: (error) => {
        console.error('Error fetching providers:', error);
      },
    });
  }

  private selectInitialModel(): void {
    if (this.providers.length > 0) {
      const azureProvider = this.providers.find((provider) => provider.toLowerCase().includes('azure'));
      this.selectedProvider = azureProvider ?? this.providers[0];
      const models = this.modelsByProvider[this.selectedProvider] || [];
      if (models.length > 0) {
        this.selectedModel = models[0].value;
      }
    }

    this.chatbotEventService.onChatbotProviderChanged.emit(this.selectedProvider);
    this.chatbotEventService.onChatbotModelNameChanged.emit(this.selectedModel);
  }

  getProviderSelectorOptions(): SelectorOption[] {
    return this.providers.map((provider, index) => new SelectorOption(index + 1, provider));
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

  handleAssistantResponse(promptId: string, message: string, metadata: any = {}): void {
    const msg = this.currentSession.addAssistantMessage(promptId, message, metadata);
    this.chatbotEventService.onPromptAnswerReceived.emit();

    console.log('Assistant Response:', msg);
  }

  sendMessage(promptMessage: string): void {
    const { provider, model } = { provider: this.selectedProvider, model: this.selectedModel };
    const userMessage = this.currentSession.addUserMessage(promptMessage);

    this.chatbotEventService.onPromptSent.emit();

    this.chatbotApiService.requestUserChatCompletion(provider, model, promptMessage).subscribe({
      next: (apiResponse) => {
        const assistantMessageContent = apiResponse?.messages.find((msg) => msg.role === 'assistant')?.content ?? '';
        const metadata = apiResponse?.metadata ?? {};
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
