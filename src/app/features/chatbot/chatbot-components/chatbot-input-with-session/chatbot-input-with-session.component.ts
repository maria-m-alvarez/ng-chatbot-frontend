import { Component, computed } from '@angular/core';
import { ChatSessionHistoryComponent } from "../chatbot-session/chat-session-history/chat-session-history.component";
import { ChatbotInputComponent } from "../chatbot-inputs/chatbot-input/chatbot-input.component";
import { ChatbotInputSettingsComponent } from "../chatbot-inputs/chatbot-input-settings/chatbot-input-settings.component";
import { AppState } from '../../../../core/app-state';
import { ChatSessionState } from '../../chatbot-models/chatbot-enums';

@Component({
  selector: 'app-chatbot-input-with-session',
  standalone: true,
  imports: [ChatSessionHistoryComponent, ChatbotInputComponent, ChatbotInputSettingsComponent],
  templateUrl: './chatbot-input-with-session.component.html',
  styleUrl: './chatbot-input-with-session.component.scss'
})
export class ChatbotInputWithSessionComponent {
  chatSessionStateEnum = ChatSessionState;

  // Reactive session state from AppState
  chatSessionState = computed(() => AppState.chatSessionState());
}
