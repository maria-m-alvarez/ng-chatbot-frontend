import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ChatbotEventService } from '../../chatbot-services/chatbot-events/chatbot-event.service';
import { ChatbotSessionService } from '../../chatbot-services/chatbot-session/chatbot-session.service';
import { SidebarComponent } from '../../../../lib/components/sidebar/sidebar.component';
import { ChatSession } from '../../chatbot-models/chatbot-session';
import { ToggleService } from '../../../../lib/toggleable/toggleable.service';
import { NgClass } from '@angular/common';
import { ButtonIconComponent } from "../../../../core/components/button-icon/button-icon.component";
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-chatbot-sidebar',
  standalone: true,
  templateUrl: './chatbot-sidebar.component.html',
  styleUrls: ['./chatbot-sidebar.component.scss'],
  imports: [NgClass, SidebarComponent, ButtonIconComponent],
})
export class ChatbotSidebarComponent implements OnInit, AfterViewInit {
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  chatSessions: ChatSession[] = [];
  allowSidebar = environment.allowSidebar;

  constructor(
    private readonly toggleService: ToggleService,
    private readonly chatbotEventManagerService: ChatbotEventService,
    private readonly chatbotMessageService: ChatbotSessionService
  ) {}

  getSidebar(): SidebarComponent | null {
    if (!this.sidebar) {
      console.warn('Sidebar component is not initialized yet.');
      return null;
    }
    return this.sidebar;
  }

  ngOnInit(): void {
    this.chatbotEventManagerService.onSidebarToggled.subscribe(() => this.toggle());
    this.chatSessions = this.chatbotMessageService.getSessions();
  }

  ngAfterViewInit(): void {
    if (!this.sidebar) {
      console.error('Sidebar component could not be found in the template.');
    }
  }

  selectSession(sessionId: string): void {
    this.chatbotMessageService.switchSession(sessionId);
  }

  toggle(): void {
    const sidebar = this.getSidebar();
    if (sidebar) {
      this.toggleService.toggle(sidebar.componentId);
    }
  }

  isCurrentSession(sessionId: string): boolean {
    return this.chatbotMessageService.currentSession.sessionId === sessionId;
  }

  createNewSession(): void {
    this.chatbotMessageService.createEmptySession(); // Assuming this method exists in the service
    this.chatSessions = this.chatbotMessageService.getSessions(); // Refresh the list
  }
  
}
