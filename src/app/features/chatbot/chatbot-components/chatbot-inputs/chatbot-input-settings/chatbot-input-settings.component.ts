import { Component, Input } from '@angular/core';
import { ChatbotBaseComponentComponent } from '../../chatbot-base-component/chatbot-base-component.component';
import { EventService } from '../../../../../core/services/event-service/event.service';
import { ChatbotBrainService } from '../../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ToggleService } from '../../../../../lib/toggleable/toggleable.service';
import { LocalizationKeys } from '../../../../../core/services/localization-service/localization.models';
import { TranslatePipe } from "../../../../../core/pipes/translate-pipe.pipe";

@Component({
  selector: 'app-chatbot-input-settings',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './chatbot-input-settings.component.html',
  styleUrl: './chatbot-input-settings.component.scss'
})
export class ChatbotInputSettingsComponent extends ChatbotBaseComponentComponent {

  @Input() useOptions: boolean = false;
  LocalizationKeys = LocalizationKeys;

  constructor(
    brain: ChatbotBrainService,
    private readonly eventService: EventService,
    private readonly toggleService: ToggleService
  ) {
    super(brain);
  }

  triggerOptionEvent(eventId: string) {
    this.eventService.userOptionsClickEvt.emit(eventId);
  }

  openChatbotSettingsModal() {
    this.toggleService.open('chatbot-settings-modal');
  }
}
