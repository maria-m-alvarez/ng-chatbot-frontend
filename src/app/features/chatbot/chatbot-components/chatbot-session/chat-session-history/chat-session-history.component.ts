import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ChatbotSessionService } from '../../../chatbot-services/chatbot-session/chatbot-session.service';
import { ChatSessionMessageAssistantComponent } from '../chat-session-message-assistant/chat-session-message-assistant.component';
import { ChatSessionMessageUserComponent } from '../chat-session-message-user/chat-session-message-user.component';
import { ChatbotEventService } from '../../../chatbot-services/chatbot-events/chatbot-event.service';
import { ChatSession } from '../../../chatbot-models/chatbot-session';

@Component({
  selector: 'app-chat-session-history',
  standalone: true,
  imports: [ChatSessionMessageAssistantComponent, ChatSessionMessageUserComponent],
  templateUrl: './chat-session-history.component.html',
  styleUrls: ['./chat-session-history.component.scss'],
})
export class ChatSessionHistoryComponent implements OnInit {
  @ViewChild('chatHistoryContainer') readonly chatHistoryContainer!: ElementRef<HTMLDivElement>;

  session!: ChatSession;
  isAtBottom: boolean = true;

  constructor(
    readonly chatbotEventService: ChatbotEventService,
    readonly chatbotSessionService: ChatbotSessionService
  ) {}

  ngOnInit(): void {
    this.refreshSession();

    this.chatbotEventService.onSessionChanged.subscribe(() => {
      this.refreshSession();
      this.scrollToBottom();
    });

    this.chatbotEventService.onPromptSent.subscribe(() => {
      this.scrollToBottom();
    });

    this.chatbotEventService.onPromptAnswerReceived.subscribe(() => {
      this.scrollToBottom();
    });

    this.scrollToBottom();
  }

  refreshSession(): void {
    this.session = this.chatbotSessionService.currentSession;
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.chatHistoryContainer.nativeElement.scrollTo({
          top: this.chatHistoryContainer.nativeElement.scrollHeight,
          behavior: 'smooth',
        });
      }, 10);
    } catch (err) {
      console.error('Smooth scroll to bottom failed:', err);
    }
  }

  onScroll(): void {
    const container = this.chatHistoryContainer.nativeElement;
    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + 150;

    this.isAtBottom = isScrolledToBottom;
  }
}
