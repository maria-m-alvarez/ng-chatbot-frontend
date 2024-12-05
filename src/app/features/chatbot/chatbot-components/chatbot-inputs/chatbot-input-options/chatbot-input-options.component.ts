import { Component } from '@angular/core';
import { ChatbotBaseComponentComponent } from '../../chatbot-base-component/chatbot-base-component.component';
import { EventService } from '../../../../../core/services/event-service/event.service';
import { ChatbotBrainService } from '../../../chatbot-services/chatbot-brain/chatbot-brain.service';

@Component({
  selector: 'app-chatbot-input-options',
  standalone: true,
  imports: [],
  templateUrl: './chatbot-input-options.component.html',
  styleUrl: './chatbot-input-options.component.scss'
})
export class ChatbotInputOptionsComponent extends ChatbotBaseComponentComponent {

  constructor(
    brain: ChatbotBrainService,
    private readonly eventService: EventService
  ) {
    super(brain);
  }

  triggerOptionEvent(eventId: string) {
    this.eventService.userOptionsClickEvt.emit(eventId);
  }
}
