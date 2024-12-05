import { Injectable } from '@angular/core';
import { ChatbotApiService } from '../chatbot-api/chatbot-api.service';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatbotSessionService } from '../chatbot-session/chatbot-session.service';
import {
  ChatbotSettings,
} from '../../chatbot-models/chatbot-settings';
import { ConfigService } from '../../../../core/config/config.service';

@Injectable({
  providedIn: 'root',
})
export class ChatbotBrainService {
  public static chatbotSettings: ChatbotSettings;
  public static chatbotInputState: string = 'idle';

  public static readonly chatbotInputStates = {
    Idle: 'idle',
    Waiting: 'waiting',
    Dragging: 'dragging',
    Error: 'error',
  };

  private readonly LOCAL_STORAGE_KEY = 'chatbotSettings';

  constructor(
    readonly configService: ConfigService,
    readonly chatbotApiService: ChatbotApiService,
    readonly chatbotEventService: ChatbotEventService,
    readonly chatbotSessionService: ChatbotSessionService
  ) {
    this.loadChatbotSettings();

    this.chatbotEventService.onSaveChatbotSettings.subscribe(() => {
      this.saveChatbotSettings();
    });

    this.chatbotEventService.onChatbotInputStateChanged.subscribe((state) => {
      ChatbotBrainService.chatbotInputState = state;
    });
  }

  get chatbotSettings(): ChatbotSettings {
    return ChatbotBrainService.chatbotSettings;
  }

  private loadChatbotSettings(): void {
    const savedSettings = localStorage.getItem(this.LOCAL_STORAGE_KEY);

    if (savedSettings) {
      ChatbotBrainService.chatbotSettings = JSON.parse(savedSettings);
    } else {
      ChatbotBrainService.chatbotSettings = new ChatbotSettings(
        'azure_openai',
        'gpt-35-turbo',
        'azure_openai',
        false,
        false,
        ChatbotSettings.defaultOptions
      );
    }

    console.log('Chatbot Settings loaded:', ChatbotBrainService.chatbotSettings);
  }

  private saveChatbotSettings(): void {
    const settingsToSave = JSON.stringify(ChatbotBrainService.chatbotSettings);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, settingsToSave);
    console.log('Chatbot Settings saved:', ChatbotBrainService.chatbotSettings);
  }

  private onChatbotSettingsChanged(): void {
    this.chatbotEventService.onChatbotSettingsChanged.emit();
  }


  // ----------------------------------------------
  // Provider Settings
  // ----------------------------------------------

  getChatbotProvider(): string {
    return ChatbotBrainService.chatbotSettings.provider;
  }

  getChatbotModel(): string {
    return ChatbotBrainService.chatbotSettings.model;
  }

  updateChatbotProvider(newProvider: string): void {
    ChatbotBrainService.chatbotSettings.provider = newProvider;
    this.onChatbotSettingsChanged();
  }

  updateChatbotModel(newModel: string): void {
    ChatbotBrainService.chatbotSettings.model = newModel;
    this.onChatbotSettingsChanged();
  }


  // ----------------------------------------------
  // Options Settings
  // ----------------------------------------------
  updateChatbotUseOptions(useOptions: boolean): void {
    ChatbotBrainService.chatbotSettings.useOptions = useOptions;
    this.onChatbotSettingsChanged();
  }

  updateChatbotStream(stream: boolean): void {
    ChatbotBrainService.chatbotSettings.stream = stream;
    this.onChatbotSettingsChanged();
  }
}
