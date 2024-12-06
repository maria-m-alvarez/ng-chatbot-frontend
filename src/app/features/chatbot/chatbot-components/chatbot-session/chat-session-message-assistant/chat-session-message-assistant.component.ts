import { Component } from '@angular/core';
import { ChatbotChatMessageComponent } from '../chatbot-chat-message.component';
import { ChatSessionMessageVoteComponent } from "../chat-session-message-vote/chat-session-message-vote.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-session-message-assistant',
  standalone: true,
  imports: [CommonModule, ChatSessionMessageVoteComponent],
  templateUrl: './chat-session-message-assistant.component.html',
  styleUrl: './chat-session-message-assistant.component.scss'
})
export class ChatSessionMessageAssistantComponent extends ChatbotChatMessageComponent {
  get allowCopy(): boolean {
    return false;
  }

  vote(vote: string) {
    console.log("WIP Voted:", vote);
  }

  copyToClipboard() {
    console.log("WIP Coppied to clipboard:");
  }

  additionalAction() {
    console.log("WIP Pressed some other action:");
  }
}
