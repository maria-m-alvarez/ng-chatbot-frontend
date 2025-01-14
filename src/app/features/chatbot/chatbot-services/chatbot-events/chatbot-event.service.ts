import { Injectable, EventEmitter } from '@angular/core';
import { WebRequestResult } from '../../../../core/models/enums';

@Injectable({
  providedIn: 'root'
})
export class ChatbotEventService {
  readonly onSidebarToggled = new EventEmitter<void>();
  
  readonly onChatbotInputStateChanged = new EventEmitter<string>();
  
  readonly onPromptSent = new EventEmitter<void>();
  readonly onPromptAnswerReceived = new EventEmitter<WebRequestResult>();
  
  readonly onRequestModelNames = new EventEmitter<void>();
  
  // Chatbot Settings
  readonly onChatbotSettingsChanged = new EventEmitter<void>();
  readonly onChatbotProviderChanged = new EventEmitter<string>();
  readonly onChatbotModelNameChanged = new EventEmitter<string>();
  readonly onSaveChatbotSettings = new EventEmitter<void>();
  
  // Chat Sessions
  readonly onSessionChanged = new EventEmitter<void>();
  readonly onSessionListUpdated = new EventEmitter<void>();

  readonly tempEvent_OnChromaDBCount = new EventEmitter<string>();

  isSidebarOpen = true;

  constructor() {}
}
