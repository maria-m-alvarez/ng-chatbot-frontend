import { Component, OnInit } from '@angular/core';
import { ChatbotEventService } from '../../chatbot-services/chatbot-events/chatbot-event.service';
import { ChatbotSessionService } from '../../chatbot-services/chatbot-session/chatbot-session.service';
import { SidebarComponent } from '../../../../lib/components/sidebar/sidebar.component';
import { ChatSession } from '../../chatbot-models/chatbot-session';
import { DomSanitizer } from '@angular/platform-browser';
import { ToggleService } from '../../../../lib/toggleable/toggleable.service';

@Component({
  selector: 'app-chatbot-sidebar',
  standalone: true,
  templateUrl: './chatbot-sidebar.component.html',
  styleUrls: ['./chatbot-sidebar.component.scss']
})
export class ChatbotSidebarComponent extends SidebarComponent implements OnInit {
  chatSessions: ChatSession[] = [];

  constructor(
    protected override readonly sanitizer: DomSanitizer,
    protected override readonly toggleService: ToggleService,
    private readonly chatbotEventManagerService: ChatbotEventService,
    private readonly chatbotMessageService: ChatbotSessionService
  ) {
    super(sanitizer, toggleService);
  }

  ngOnInit() {
    this.chatbotEventManagerService
      .onSidebarToggled
      .subscribe(() => this.toggle());

    this.chatSessions = this.chatbotMessageService.getSessions();
  }

  selectSession(sessionId: string): void {
    this.chatbotMessageService.switchSession(sessionId);
  }

  override toggle() {
    super.toggle();
    this.chatbotEventManagerService.isSidebarOpen = this.isOpen;
  }
}
