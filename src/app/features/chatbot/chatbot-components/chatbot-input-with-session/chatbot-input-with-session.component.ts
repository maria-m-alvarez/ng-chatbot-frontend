import { Component } from '@angular/core';
import { ChatSessionHistoryComponent } from "../chatbot-session/chat-session-history/chat-session-history.component";
import { ChatbotInputComponent } from "../chatbot-inputs/chatbot-input/chatbot-input.component";
import { ChatbotInputSettingsComponent } from "../chatbot-inputs/chatbot-input-settings/chatbot-input-settings.component";
import { AppState } from '../../../../core/app-state';
import { ChatSessionState } from '../../chatbot-models/chatbot-enums';
import { LocalizationKeys } from '../../../../core/services/localization-service/localization.models';
import { TranslatePipe } from "../../../../core/pipes/translate-pipe.pipe";
import { MagiaPipe } from '../../../../core/pipes/magia.pipe';

@Component({
  selector: 'app-chatbot-input-with-session',
  standalone: true,
  imports: [ChatSessionHistoryComponent, ChatbotInputComponent, ChatbotInputSettingsComponent, TranslatePipe, MagiaPipe],
  templateUrl: './chatbot-input-with-session.component.html',
  styleUrl: './chatbot-input-with-session.component.scss'
})
export class ChatbotInputWithSessionComponent {
  chatSessionStateEnum = ChatSessionState;
  chatSessionState = AppState.chatSessionState;
  LocalizationKeys = LocalizationKeys;
}
