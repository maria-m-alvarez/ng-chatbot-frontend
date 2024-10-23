import { Injectable, EventEmitter } from '@angular/core';
import { WebRequestResult } from '../../../common/models/enums';

@Injectable({
  providedIn: 'root'
})
export class ChatbotEventService {
  readonly onSidebarToggled = new EventEmitter<void>();
  readonly onSessionChanged = new EventEmitter<void>();

  readonly onPromptSent = new EventEmitter<void>();
  readonly onPromptAnswerReceived = new EventEmitter<WebRequestResult>();

  readonly onChatbotApiConnectionNameChanged = new EventEmitter<string>();
  readonly onSaveChatbotSettings = new EventEmitter<void>();

  readonly onChatbotInputStateChanged = new EventEmitter<string>();

  isSidebarOpen = true;

  constructor() {}
}
