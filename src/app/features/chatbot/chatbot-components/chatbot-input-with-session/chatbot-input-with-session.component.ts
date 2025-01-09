import { Component } from '@angular/core';
import { ChatSessionHistoryComponent } from "../chatbot-session/chat-session-history/chat-session-history.component";
import { ChatbotInputComponent } from "../chatbot-inputs/chatbot-input/chatbot-input.component";

@Component({
  selector: 'app-chatbot-input-with-session',
  standalone: true,
  imports: [ChatSessionHistoryComponent, ChatbotInputComponent],
  templateUrl: './chatbot-input-with-session.component.html',
  styleUrl: './chatbot-input-with-session.component.scss'
})
export class ChatbotInputWithSessionComponent {

}
