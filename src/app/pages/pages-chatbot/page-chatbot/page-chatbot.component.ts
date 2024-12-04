import { Component } from '@angular/core';
import { ChatbotBaseComponentComponent } from '../../../features/chatbot/chatbot-components/chatbot-base-component/chatbot-base-component.component';
import { ModularHeaderComponent } from "../../../core/components/modular/modular-header/modular-header.component";
import { UserOptionsButtonComponent } from "../../../features/user/user-components/user-options-button/user-options-button.component";
import { ChatbotSessionHistoryComponent } from "../../../features/chatbot/chatbot-components/chatbot-session-history/chatbot-session-history.component";
import { ChatbotInputComponent } from "../../../features/chatbot/chatbot-components/chatbot-inputs/chatbot-input/chatbot-input.component";

@Component({
  selector: 'app-page-chatbot',
  standalone: true,
  imports: [ModularHeaderComponent, UserOptionsButtonComponent, ChatbotSessionHistoryComponent, ChatbotInputComponent],
  templateUrl: './page-chatbot.component.html',
  styleUrl: './page-chatbot.component.scss'
})

export class PageChatbotComponent extends ChatbotBaseComponentComponent {
  ngOnInit() {
    this.brain.chatbotSessionService.createEmptySession();
  }
}
