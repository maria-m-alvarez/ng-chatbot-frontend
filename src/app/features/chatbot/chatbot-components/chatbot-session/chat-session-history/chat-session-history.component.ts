import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, computed } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { ChatbotSessionService } from '../../../chatbot-services/chatbot-session/chatbot-session.service';
import { ChatSessionMessageAssistantComponent } from '../chat-messages/chat-session-message-assistant/chat-session-message-assistant.component';
import { ChatSessionMessageUserComponent } from '../chat-messages/chat-session-message-user/chat-session-message-user.component';
import { ChatbotEventService } from '../../../chatbot-services/chatbot-events/chatbot-event.service';
import { AppState } from '../../../../../core/app-state';

@Component({
  selector: 'app-chat-session-history',
  standalone: true,
  imports: [ChatSessionMessageAssistantComponent, ChatSessionMessageUserComponent, CdkScrollable],
  templateUrl: './chat-session-history.component.html',
  styleUrls: ['./chat-session-history.component.scss'],
})
export class ChatSessionHistoryComponent implements OnInit, AfterViewInit {
  @ViewChild(CdkScrollable) scrollable!: CdkScrollable;
  @ViewChild('chatHistoryContainer') readonly chatHistoryContainer!: ElementRef<HTMLDivElement>;

  session = computed(() => AppState.activeChatSession());
  isAtBottom = true;

  constructor(
    readonly chatbotEventService: ChatbotEventService,
    readonly chatbotSessionService: ChatbotSessionService
  ) {}

  ngOnInit(): void {
    this.chatbotEventService.onSessionChanged.subscribe(() => this.handleSessionChange());
    this.chatbotEventService.onPromptSent.subscribe(() => this.scrollToBottom());
    this.chatbotEventService.onPromptAnswerReceived.subscribe(() => this.scrollToBottom());
  }

  ngAfterViewInit(): void {
    this.scrollable.elementScrolled().subscribe(() => this.onScroll());
  }

  private handleSessionChange(): void {
    // Ensure new session messages are rendered before scrolling
    setTimeout(() => {
      requestAnimationFrame(() => {
        this.scrollToBottom();
      });
    }, 50);
  }

  onScroll(): void {
    if (!this.chatHistoryContainer?.nativeElement) return;

    const container = this.chatHistoryContainer.nativeElement;
    const isScrolledToBottom =
      Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 10;

    this.isAtBottom = isScrolledToBottom;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (!this.chatHistoryContainer?.nativeElement) return;

      this.chatHistoryContainer.nativeElement.scrollTo({
        top: this.chatHistoryContainer.nativeElement.scrollHeight,
        behavior: 'smooth',
      });

      setTimeout(() => this.onScroll(), 200);
    }, 10);
  }
}
