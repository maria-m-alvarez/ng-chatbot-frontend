import { Injectable } from '@angular/core';
import { ChatbotApiService } from '../chatbot-api/chatbot-api.service';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatbotSessionService } from '../chatbot-session/chatbot-session.service';
import {
  ChatbotOptionsLevel,
  ChatbotSettings,
} from '../../chatbot-models/chatbot-settings';
import { ConfigService } from '../../../../core/config/config.service';
import { EventService } from '../../../../core/services/event-service/event.service';

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
    readonly eventService: EventService,
    readonly chatbotEventService: ChatbotEventService,
    readonly chatbotSessionService: ChatbotSessionService,
    readonly chatbotApiService: ChatbotApiService
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

  // Load chatbot settings from local storage or config defaults
  private loadChatbotSettings(): void {
    const savedSettings = localStorage.getItem(this.LOCAL_STORAGE_KEY);

    if (savedSettings) {
      ChatbotBrainService.chatbotSettings = JSON.parse(savedSettings);
    } else {
      ChatbotBrainService.chatbotSettings = this.configService.chatbotSettings;
    }

    console.log('Chatbot Settings loaded:', ChatbotBrainService.chatbotSettings);
  }

  // Save the current chatbot settings to local storage
  private saveChatbotSettings(): void {
    const settingsToSave = JSON.stringify(ChatbotBrainService.chatbotSettings);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, settingsToSave);
    console.log('Chatbot Settings saved to local storage:', ChatbotBrainService.chatbotSettings);
  }

  updateChatbotConnectionName(newConnectionName: string): void {
    ChatbotBrainService.chatbotSettings.connectionName = newConnectionName;
    this.configService.updateConnectionName(newConnectionName);
    this.chatbotEventService.onChatbotSettingsChanged.emit();
  }

  updateChatbotModel(newModel: string): void {
    ChatbotBrainService.chatbotSettings.model = newModel;
    this.chatbotEventService.onChatbotSettingsChanged.emit();
  }

  updateChatbotStream(shouldStream: boolean): void {
    ChatbotBrainService.chatbotSettings.stream = shouldStream;
    this.chatbotEventService.onChatbotSettingsChanged.emit();
  }

  updateChatbotUseOptions(shouldUseOptions: boolean): void {
    ChatbotBrainService.chatbotSettings.useOptions = shouldUseOptions;
    this.chatbotEventService.onChatbotSettingsChanged.emit();
  }

  updateChatbotSettings(newSettings: ChatbotSettings): void {
    ChatbotBrainService.chatbotSettings = newSettings;
    this.chatbotEventService.onChatbotSettingsChanged.emit();
  }
}
