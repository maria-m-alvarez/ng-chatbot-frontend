import { Component } from '@angular/core';
import { ChatbotChatMessageComponent } from '../chatbot-chat-message.component';

@Component({
  selector: 'app-chat-session-message-user',
  standalone: true,
  imports: [],
  templateUrl: './chat-session-message-user.component.html',
  styleUrl: './chat-session-message-user.component.scss'
})
export class ChatSessionMessageUserComponent extends ChatbotChatMessageComponent {

}
