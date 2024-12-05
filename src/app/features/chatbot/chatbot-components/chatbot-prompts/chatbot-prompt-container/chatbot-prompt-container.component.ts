import { Component, Input } from '@angular/core';
import { ChatbotBaseComponentComponent } from '../../chatbot-base-component/chatbot-base-component.component';
import { ChatbotBrainService } from '../../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { ChatSessionMessage } from '../../../chatbot-models/chatbot-models';

@Component({
  selector: 'app-chatbot-prompt-container',
  standalone: true,
  imports: [],
  templateUrl: './chatbot-prompt-container.component.html',
  styleUrls: ['./chatbot-prompt-container.component.scss'],
})
export class ChatbotPromptContainerComponent extends ChatbotBaseComponentComponent {
  @Input() role: string = 'assistant';
  @Input() message: string = '';
  @Input() avatar: string | null = null;
  @Input() chatMessage: ChatSessionMessage | null = null;

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
    let html = await marked.parse(message); // Wait for the parsed HTML
    console.log('Sanitized message:', html);
    console.log("Metadata:", this.getMetadata());
    const documentSources = this.getDocuments()
      .map(
        (doc) => `<strong>${doc.Document}</strong> (Page ${doc.Page})`
      )
      .join(', ');

    if (documentSources) {
      html += `<div class="mt-2 text-sm text-main-secondary"><strong>Sources:</strong> ${documentSources}</div>`;
    }

    return this.sanitizer.bypassSecurityTrustHtml(html); // Sanitize and return the result
  }

  getMetadata(): any {
    return this.chatMessage?.metadata;
  }

  getDocuments(): { Document: string; Page: number }[] {
    return this.getMetadata()?.documents || [];
  }
}
