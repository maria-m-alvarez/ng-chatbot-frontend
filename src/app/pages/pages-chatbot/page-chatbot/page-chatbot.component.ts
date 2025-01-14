import { Component } from '@angular/core';
import { ChatbotBaseComponentComponent } from '../../../features/chatbot/chatbot-components/chatbot-base-component/chatbot-base-component.component';
import { ModularHeaderComponent } from "../../../core/components/modular/modular-header/modular-header.component";
import { UserOptionsButtonComponent } from "../../../features/user/user-components/user-options-button/user-options-button.component";
import { ButtonForToggleablesComponent } from "../../../core/components/button-for-toggleables/button-for-toggleables.component";
import { ChatbotInputWithSessionComponent } from "../../../features/chatbot/chatbot-components/chatbot-input-with-session/chatbot-input-with-session.component";
import { ChatbotSidebarComponent } from "../../../features/chatbot/chatbot-components/chatbot-sidebar/chatbot-sidebar.component";
import { environment } from '../../../../environments/environment';
import { ChatbotBrainService } from '../../../features/chatbot/chatbot-services/chatbot-brain/chatbot-brain.service';

@Component({
  selector: 'app-page-chatbot',
  standalone: true,
  imports: [
    ModularHeaderComponent,
    UserOptionsButtonComponent,
    ButtonForToggleablesComponent,
    ChatbotInputWithSessionComponent,
    ChatbotSidebarComponent,
  ],
  templateUrl: './page-chatbot.component.html',
  styleUrls: ['./page-chatbot.component.scss'],
})
export class PageChatbotComponent extends ChatbotBaseComponentComponent {
  allowSidebar = environment.allowSidebar;

  constructor(
    brainService: ChatbotBrainService,
  ) {
    super(brainService);
    this.fetchAllSessions();
  }

  ngAfterViewInit(): void {
    this.fetchAllSessions();
  }

  private fetchAllSessions(): void {
    this.brain.chatbotSessionService.fetchSessions();
  }
}
