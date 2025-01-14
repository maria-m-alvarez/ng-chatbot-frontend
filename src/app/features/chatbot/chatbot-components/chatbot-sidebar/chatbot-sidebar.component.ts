import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../../../lib/components/sidebar/sidebar.component';
import { ChatSession } from '../../chatbot-models/chatbot-session';
import { ToggleService } from '../../../../lib/toggleable/toggleable.service';
import { ButtonIconComponent } from "../../../../core/components/button-icon/button-icon.component";
import { ChatbotBrainService } from '../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ChatSessionListComponent } from "../chatbot-session/chat-session-list/chat-session-list.component";

@Component({
  selector: 'app-chatbot-sidebar',
  standalone: true,
  templateUrl: './chatbot-sidebar.component.html',
  styleUrls: ['./chatbot-sidebar.component.scss'],
  imports: [SidebarComponent, ButtonIconComponent, ChatSessionListComponent],
})
export class ChatbotSidebarComponent implements OnInit, AfterViewInit {
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  chatSessions: ChatSession[] = [];

  constructor(
    private readonly toggleService: ToggleService,
    private readonly brain: ChatbotBrainService
  ) {
    this.brain.chatbotEventService.onSessionListUpdated.subscribe(() => {
      this.chatSessions = this.brain.chatbotSessionService.getSessions();
    });
  }

  getSidebar(): SidebarComponent | null {
    if (!this.sidebar) {
      console.warn('Sidebar component is not initialized yet.');
      return null;
    }
    return this.sidebar;
  }

  ngOnInit(): void {
    this.brain.chatbotEventService.onSidebarToggled.subscribe(() => this.toggle());
    this.chatSessions = this.brain.chatbotSessionService.getSessions();
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
    this.brain.chatbotSessionService.createEmptySession(); // Assuming this method exists in the service
    this.chatSessions = this.brain.chatbotSessionService.getSessions(); // Refresh the list
  }
}
