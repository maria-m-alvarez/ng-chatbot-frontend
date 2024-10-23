import { Injectable } from '@angular/core';
import { EventService } from '../../../common/services/event-service/event.service';
import { ChatbotApiService } from '../chatbot-api/chatbot-api.service';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ChatbotSessionService } from '../chatbot-session/chatbot-session.service';
import {
  ChatbotOptionsLevel,
  ChatbotSettings,
} from '../../chatbot-models/chatbot-settings';
import { ConfigService } from '../../../config/config.service';

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
    Error: 'error'
  }

  private readonly LOCAL_STORAGE_KEY = 'chatbotSettings';

  constructor(
    public readonly configService: ConfigService,
    public readonly eventService: EventService,
    public readonly chatbotEventService: ChatbotEventService,
    public readonly chatbotSessionService: ChatbotSessionService,
    public readonly chatbotApiService: ChatbotApiService
  ) {
    this.loadChatbotSettings();

    chatbotEventService.onSaveChatbotSettings.subscribe(() => {
      this.saveChatbotSettings();
    });

    chatbotEventService.onChatbotInputStateChanged.subscribe((state) => {
      ChatbotBrainService.chatbotInputState = state;
    });
  }

  get chatbotSettings(): ChatbotSettings {
    return ChatbotBrainService.chatbotSettings;
  }

  // Load chatbot settings from local storage, or use the config defaults if no saved settings
  private loadChatbotSettings() {
    const savedSettings = localStorage.getItem(this.LOCAL_STORAGE_KEY);

    if (savedSettings) {
      // Parse and load settings from local storage if found
      ChatbotBrainService.chatbotSettings = JSON.parse(savedSettings);
    } else {
      // Use the configService settings if no saved settings
      ChatbotBrainService.chatbotSettings = new ChatbotSettings(
        this.configService.chatbotModel,
        this.configService.apiConnectionName,
        this.configService.isStreamingEnabled,
        this.configService.useOptions,
        this.configService.chatbotOptionsLevel === ChatbotOptionsLevel.Simple
          ? this.configService.getSimpleChatbotOptions() ?? ChatbotSettings.simpleDefaultOptions
          : this.configService.getCompleteChatbotOptions() ?? ChatbotSettings.completeDefaultOptions
      );

      ChatbotBrainService.chatbotSettings.prePrompt = this.configService.prePrompt;
    }

    console.log('Chatbot Settings loaded:', ChatbotBrainService.chatbotSettings);
  }

  // Save the current chatbot settings to local storage
  private saveChatbotSettings() {
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
