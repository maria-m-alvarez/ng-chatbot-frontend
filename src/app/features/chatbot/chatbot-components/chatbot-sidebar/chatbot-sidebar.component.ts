import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../../../lib/components/sidebar/sidebar.component';
import { ClientChatSession } from '../../chatbot-models/chatbot-client-session';
import { ToggleService } from '../../../../lib/toggleable/toggleable.service';
import { ButtonIconComponent } from '../../../../core/components/button-icon/button-icon.component';
import { ChatbotBrainService } from '../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ChatSessionListComponent } from '../chatbot-session/chat-session-list/chat-session-list.component';

@Component({
  selector: 'app-chatbot-sidebar',
  standalone: true,
  templateUrl: './chatbot-sidebar.component.html',
  styleUrls: ['./chatbot-sidebar.component.scss'],
  imports: [SidebarComponent, ButtonIconComponent, ChatSessionListComponent],
})
export class ChatbotSidebarComponent implements OnInit, AfterViewInit {
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  
  chatSessions: ClientChatSession[];

  constructor(
    private readonly toggleService: ToggleService,
    private readonly brain: ChatbotBrainService
  ) {
    // Subscribe to session updates using observable (eliminates manual state tracking)
    this.chatSessions = this.brain.chatbotSessionService.sessions;
  }

  /** Get Sidebar Component */
  getSidebar(): SidebarComponent | null {
    if (!this.sidebar) {
      console.warn('Sidebar component is not initialized yet.');
      return null;
    }
    return this.sidebar;
  }

  ngOnInit(): void {
    this.brain.chatbotEventService.onSidebarToggled.subscribe(() => this.toggle());
  }

  ngAfterViewInit(): void {
    if (!this.sidebar) {
      console.error('Sidebar component could not be found in the template.');
    }
  }

  toggle(): void {
    const sidebar = this.getSidebar();
    if (sidebar) {
      this.toggleService.toggle(sidebar.componentId);
    }
  }

  createNewSession(): void {
    this.brain.chatbotSessionService.createEmptyChatSession();
  }
}
