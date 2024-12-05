import { Injectable } from '@angular/core';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatSession, ChatSessionMessage } from '../../chatbot-models/chatbot-models';
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
    this.getModelNames();
  }

  private initializeEventListeners(): void {
    this.chatbotEventService.onChatbotSettingsChanged.subscribe(() => {
      this.getModelNames();
    });

    this.chatbotEventService.onRequestModelNames.subscribe(() => {
      this.getModelNames();
    });
  }

  private getModelNames(): void {
    this.chatbotApiService.getAllProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
        const modelRequests = providers.map((provider) =>
          this.chatbotApiService.getAllModelsByProvider(provider).pipe(
            map((response) => ({
              provider: provider,
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
            console.log('Models by Provider:', this.modelsByProvider);
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
      this.selectedProvider = this.providers[0];
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
  
  private getCurrentProviderAndModel(): { provider: string; model: string } {
    return {
      provider: this.selectedProvider,
      model: this.selectedModel,
    };
  }

  private initializeSessions(): void {
    this.createSession(
      '-1',
      'Example Session',
      'user123',
      [
        { prompt: 'Hello, chatbot!', answer: 'Hello! How can I assist you today?' },
        { prompt: 'What’s the weather like?', answer: 'It’s sunny and 75°F right now.' },
        {
          prompt: 'Is it possible for a strawberry to be a banana?',
          answer:
            'While it may seem like an odd concept, if we delve into the world of possibilities and imagination, there are interesting ways to think about how a strawberry could be a banana.',
        },
      ],
      true
    );
  }

  private createSession(
    sessionId: string,
    title: string,
    userId: string,
    promptsAndAnswers: { prompt: string; answer: string }[],
    switchToSession: boolean = false
  ): void {
    const session = new ChatSession(sessionId, title, userId);

    promptsAndAnswers.forEach(({ prompt, answer }) => {
      const promptItem = session.addPrompt(prompt);
      session.addPromptAnswer(promptItem.id, answer);
    });

    this.sessions.push(session);

    if (switchToSession) {
      this.switchSession(session.sessionId);
    }
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
    if (!this.currentSession) {
      this.currentSession = this.sessions[0];
      this.currentSession.isCurrent = true;
    }

    if (this.currentSession.sessionId === sessionId) {
      return;
    }

    const session = this.sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      this.currentSession.isCurrent = false;
      this.currentSession = session;
      this.currentSession.isCurrent = true;

      this.chatbotEventService.onSessionChanged.emit();
    }
  }

  handleAssistantResponse(promptId: string, message: string): void {
    console.log('Assistant response:', message);
    this.currentSession.addPromptAnswer(promptId, message);
    this.chatbotEventService.onPromptAnswerReceived.emit();
  }

  getSessionMessages(): ChatSessionMessage[] {
    const session = this.currentSession;
    const allMessages: ChatSessionMessage[] = [];

    session.prompts.forEach((prompt, index) => {
      allMessages.push(new ChatSessionMessage(prompt.id, 'user', prompt.content));

      if (session.promptAnswers[index]) {
        const answer = session.promptAnswers[index];
        allMessages.push(new ChatSessionMessage(answer.id, 'assistant', answer.content));
      }
    });

    return allMessages;
  }

  sendMessage(promptMessage: string): void {
    console.log('Sending prompt:', promptMessage);
    const { provider, model } = this.getCurrentProviderAndModel();

    const prompt = this.currentSession.addPrompt(promptMessage);
    this.chatbotEventService.onPromptSent.emit();

    this.chatbotApiService.sendChatPrompt(provider, model, promptMessage).subscribe({
      next: (apiResponse) => {
        console.log('API response:', apiResponse);
        const assistantMessage = apiResponse?.messages.find((msg) => msg.role === 'assistant')?.content ?? "";

        this.handleAssistantResponse(prompt.id, assistantMessage);
        this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Success);
      },
      error: (error) => {
        console.error('Error from chatbot API:', error);
        this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Error);
      },
      complete: () => {
        console.log('API Prompt call completed');
        this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Complete);
      },
    });
  }

  stopProcessing(): void {
    console.warn('stopProcessing is not implemented yet.');
  }

  handleFiles(files: File[]): void {
    console.log('Handling files:', files);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).slice(2, 11);
  }
}
