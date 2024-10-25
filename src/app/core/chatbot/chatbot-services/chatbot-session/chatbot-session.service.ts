import { Injectable } from '@angular/core';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatSession, ChatSessionMessage } from '../../chatbot-models/chatbot-models';
import { ConfigService } from '../../../config/config.service';
import { SelectorOption } from '../../../common/components/input-components/input-selector/input-selector.component';
import { ChatbotApiService } from '../chatbot-api/chatbot-api.service';
import { EventService } from '../../../common/services/event-service/event.service';
import { ChatbotBrainService } from '../chatbot-brain/chatbot-brain.service';
import { WebRequestResult } from '../../../common/models/enums';

@Injectable({
  providedIn: 'root'
})
export class ChatbotSessionService {
  currentSession!: ChatSession;
  sessions: ChatSession[] = [];

  modelNames: string[] = ['phi', 'llama3', 'aya:8b', 'stablelm2:1.6b'];

  llmModels: SelectorOption[] = [
    { id: 1, value: 'phi' },
    { id: 2, value: 'llama3' },
    { id: 3, value: 'aya:8b' },
    { id: 4, value: 'stablelm2:1.6b' }
  ];

  constructor(
    readonly configService: ConfigService,
    readonly eventService: EventService,
    readonly chatbotEventService: ChatbotEventService,
    private readonly chatbotApiService: ChatbotApiService
  ) {
    this.initializeSessions();

    this.chatbotEventService.onChatbotSettingsChanged.subscribe(() => {
      this.getModelNames();
    });

    this.chatbotEventService.onRequestModelNames.subscribe(() => {
      this.getModelNames();
    });

    this.getModelNames();
  }

  private getModelNames() : void {
    this.chatbotApiService.getAvailableModelNames().subscribe(
      {
        next: (response) => {
          console.log('Model names:', response);
          this.modelNames = response;
          this.llmModels = this.modelNames.map((name, index) => ({ id: index + 1, value: name }));
          this.selectInitialModel();
        },
        error: (error) => {
          console.error('Error from chatbot API:', error);
          this.llmModels = this.modelNames.map((name, index) => ({ id: index + 1, value: name }));
          this.selectInitialModel();
        },
        complete: () => {
          console.log('LLM Models:', this.llmModels);
        }
      }
    );
  }

  private getCurrentModel(): string {
    return ChatbotBrainService.chatbotSettings.model ?? this.llmModels[0].value;
  }
  
  private selectInitialModel(): void {
    const llamaModel = this.llmModels.find(model => model.value.toLowerCase().includes('llama'));
    this.chatbotEventService.onChatbotModelNameChanged.emit(llamaModel?.value ?? this.llmModels[0].value);
  }

  private initializeSessions(): void {
    this.createSession(
      '-1', 
      'Example Session', 
      'user123',
      [
        { prompt: 'Hello, chatbot!', answer: 'Hello! How can I assist you today?' },
        { prompt: 'What’s the weather like?', answer: 'It’s sunny and 75°F right now.' },
        { prompt: 'Is it possible for a strawberry to be a banana?', answer: 
          'While it may seem like an odd concept, if we delve into the world of possibilities and imagination, there are interesting ways to think about how a strawberry could be a banana.' }
      ],
      true
    );

    this.createSession(
      this.generateSessionId(),
      'Frontend Appreciation',
      'user124',
      [
        { prompt: 'What do you think about this frontend?', answer: 'This frontend is amazing! The UI is clean, intuitive, and responsive.' },
        { prompt: 'What makes it so great?', answer: 'The integration of components, state management, and performance optimization makes it great.' }
      ]
    );

    this.createSession(
      this.generateSessionId(),
      'Video Game Development',
      'user125',
      [
        { prompt: 'Can you tell me about video game development?', answer: 'Video game development involves various disciplines such as programming, art, and design.' },
        { prompt: 'What are some key skills for game development?', answer: 'Skills in programming, problem-solving, and 3D modeling are essential.' }
      ]
    );
  }

  private createSession(sessionId: string, title: string, userId: string, promptsAndAnswers: { prompt: string, answer: string }[], switchToSession: boolean = false): void {
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

    const session = this.sessions.find(s => s.sessionId === sessionId);
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

  handleFiles(files: File[]): void {
    console.log('Handling files:', files);
  }

  /*
  {
    "prompt": {
        "content": "minsait",
        "created_at": "2024-10-17T14:50:56.064415+00:00",
        "id": 40,
        "role": "user",
        "updated_at": "2024-10-17T14:50:56.064415+00:00"
    },
    "prompt_answer": {
        "content": "Infelizmente, não há informação suficiente no contexto para responder à pergunta \"Minsait\". Lamento, mas não tenho a informação necessária para responder a essa pergunta.",
        "created_at": "2024-10-17T14:51:59.945640+00:00",
        "id": 39,
        "processing_time": 54.37232160568237,
        "prompt_id": 40,
        "role": "assistant",
        "updated_at": "2024-10-17T14:51:59.946638+00:00"
    }
  }
  */

  sendMessage(promptMessage: string) {
    console.log('Sending prompt:', promptMessage);
    const model = this.getCurrentModel();

    const prompt = this.currentSession.addPrompt(promptMessage);
    this.chatbotEventService.onPromptSent.emit();

    this.chatbotApiService.sendChatPromptAndGetChatPromptAnswer(promptMessage, model).subscribe({
      next: (apiResponse) => {
        console.log('API response:', apiResponse);
        const promptAnswer = apiResponse?.response?.message?.content;

        this.handleAssistantResponse(prompt.id, promptAnswer);
        this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Success);
      },
      error: (error) => {
        console.error('Error from chatbot API:', error);
        this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Error);
      },
      complete: () => {
        console.log('API Prompt call completed');
        this.chatbotEventService.onPromptAnswerReceived.emit(WebRequestResult.Complete);
      }
    });
  }
  
  stopProcessing() {
    throw new Error('Method not implemented.');
  }

  private generateSessionId(): string {
    return Math.random().toString(36).slice(2, 11);
  }
}
