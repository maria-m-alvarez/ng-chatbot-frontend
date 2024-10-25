import { Injectable, EventEmitter } from '@angular/core';
import { WebRequestResult } from '../../../common/models/enums';

@Injectable({
  providedIn: 'root'
})
export class ChatbotEventService {
  readonly onSidebarToggled = new EventEmitter<void>();
  readonly onSessionChanged = new EventEmitter<void>();

  readonly onChatbotInputStateChanged = new EventEmitter<string>();

  readonly onPromptSent = new EventEmitter<void>();
  readonly onPromptAnswerReceived = new EventEmitter<WebRequestResult>();

  readonly onRequestModelNames = new EventEmitter<void>();
  
  readonly onChatbotSettingsChanged = new EventEmitter<void>();
  readonly onChatbotModelNameChanged = new EventEmitter<string>();
  readonly onSaveChatbotSettings = new EventEmitter<void>();

  isSidebarOpen = true;

  constructor() {}
}
