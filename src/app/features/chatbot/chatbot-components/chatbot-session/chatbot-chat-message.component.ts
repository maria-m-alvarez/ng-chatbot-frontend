import { Component, Input } from '@angular/core';
import { ChatbotBaseComponentComponent } from '../chatbot-base-component/chatbot-base-component.component';
import { ChatbotBrainService } from '../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatMessage } from '../../chatbot-models/chatbot-session';

@Component({
  selector: 'app-chatbot-chat-message',
  standalone: true,
  template: '',
  styles: '',
})
export class ChatbotChatMessageComponent extends ChatbotBaseComponentComponent {
  @Input() chatMessage: ChatMessage | null = null;
  sanitizedMessage: SafeHtml = '';
  showSources: boolean = false;
  groupedSources: { Document: string; Pages: number[] }[] = [];

  constructor(
    brain: ChatbotBrainService,
    private readonly sanitizer: DomSanitizer
  ) {
    super(brain);
  }

  async ngOnChanges(): Promise<void> {
    if (this.chatMessage) {
      this.sanitizedMessage = this.sanitizeMessage(this.chatMessage.content);
      this.groupedSources = this.groupDocumentSources();
    }
  }

  toggleSources(): void {
    this.showSources = !this.showSources;
  }

  hasDocuments(): boolean {
    return this.getDocuments().length > 0;
  }

  private groupDocumentSources(): { Document: string; Pages: number[] }[] {
    const documents = this.getDocuments();
    const grouped = documents.reduce((acc, doc) => {
      const existing = acc.find((item) => item.Document === doc.Document);
      if (existing) {
        existing.Pages.push(doc.Page);
      } else {
        acc.push({ Document: doc.Document, Pages: [doc.Page] });
      }
      return acc;
    }, [] as { Document: string; Pages: number[] }[]);

    return grouped.map((doc) => ({
      ...doc,
      Pages: [...new Set(doc.Pages)].sort((a, b) => a - b),
    }));
  }

  private sanitizeMessage(message: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(message);
  }

  private getDocuments(): { Document: string; Page: number }[] {
    return this.chatMessage?.metadata?.documents || [];
  }
}
