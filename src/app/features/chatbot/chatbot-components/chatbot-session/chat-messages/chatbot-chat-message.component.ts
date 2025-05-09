import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatMessage } from '../../../chatbot-models/chatbot-api-response-models';
import { ClientChatMessage } from '../../../chatbot-models/chatbot-client-session';
import { ChatbotBrainService } from '../../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ChatbotBaseComponentComponent } from '../../chatbot-base-component/chatbot-base-component.component';

@Component({
  selector: 'app-chatbot-chat-message',
  standalone: true,
  template: '',
  styles: '',
})
export class ChatbotChatMessageComponent extends ChatbotBaseComponentComponent implements OnChanges {
  @Input() chatMessage: ChatMessage | ClientChatMessage | null = null;
  sanitizedMessage: SafeHtml = '';
  showSources: boolean = false;
  groupedSources: { doc_name: string; pages: number[] }[] = [];

  constructor(
    brain: ChatbotBrainService,
    protected readonly sanitizer: DomSanitizer
  ) {
    super(brain);
  }

  ngOnChanges(): void {
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

  private groupDocumentSources(): { doc_name: string; pages: number[] }[] {
    const documents = this.getDocuments();
    const grouped = documents.reduce((acc, doc) => {
      const existing = acc.find((item) => item.doc_name === doc.doc_name);
      if (existing) {
        existing.pages.push(doc.doc_page);
      } else {
        acc.push({ doc_name: doc.doc_name, pages: [doc.doc_page] });
      }
      return acc;
    }, [] as { doc_name: string; pages: number[] }[]);

    return grouped.map((doc) => ({
      ...doc,
      pages: [...new Set(doc.pages)].sort((a, b) => a - b),
    }));
  }

  private sanitizeMessage(message: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(message);
  }

  private getDocuments(): { doc_id: number; doc_name: string; doc_page: number; doc_content: string }[] {
    if (!this.chatMessage) return [];
    return (this.chatMessage as any)?.metadata?.documents ?? [];
  }
}
