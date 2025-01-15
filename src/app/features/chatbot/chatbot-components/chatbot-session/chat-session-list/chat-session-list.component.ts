import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ChatbotBrainService } from '../../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ChatSession } from '../../../chatbot-models/chatbot-session';

@Component({
  selector: 'app-chat-session-list',
  standalone: true,
  imports: [NgClass],
  templateUrl: './chat-session-list.component.html',
  styleUrl: './chat-session-list.component.scss'
})
export class ChatSessionListComponent {
  chatSessions: ChatSession[] = [];

  constructor(
    private readonly brain: ChatbotBrainService
  ) {
    this.brain.chatbotEventService.onSessionListUpdated.subscribe(() => {
      this.chatSessions = this.brain.chatbotSessionService.getSessions();
    });
  }

  isCurrentSession(sessionId: string): boolean {
    const currentSession = this.brain.chatbotSessionService.currentSession;
    return currentSession ? currentSession.sessionId === sessionId : false;
}

  selectSession(sessionId: string): void {
    this.brain.chatbotSessionService.switchSession(sessionId);
  }
}
