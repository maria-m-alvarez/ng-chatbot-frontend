import { Component, Input } from '@angular/core';
import { ChatbotBaseComponentComponent } from '../../chatbot-base-component/chatbot-base-component.component';
import { ChatbotBrainService } from '../../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Component({
  selector: 'app-chatbot-prompt-container',
  standalone: true,
  imports: [],
  templateUrl: './chatbot-prompt-container.component.html',
  styleUrls: ['./chatbot-prompt-container.component.scss']
})
export class ChatbotPromptContainerComponent extends ChatbotBaseComponentComponent {
  @Input() role: string = 'assistant';
  @Input() message: string = '';
  @Input() avatar: string | null = null;

  sanitizedMessage: SafeHtml = '';

  constructor(
    brain: ChatbotBrainService,
    protected readonly sanitizer: DomSanitizer
  ) {
    super(brain);
  }

  async ngOnChanges(): Promise<void> {
    this.sanitizedMessage = await this.sanitizeMessage(this.message);
  }

  private async sanitizeMessage(message: string): Promise<SafeHtml> {
    const html = await marked.parse(message); // Wait for the parsed HTML
    return this.sanitizer.bypassSecurityTrustHtml(html); // Sanitize and return the result
  }
}
