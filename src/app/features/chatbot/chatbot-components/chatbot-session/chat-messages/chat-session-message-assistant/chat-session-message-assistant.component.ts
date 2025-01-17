import { Component } from '@angular/core';
import { ChatSessionMessageVoteComponent } from "../chat-session-message-vote/chat-session-message-vote.component";
import { CommonModule } from '@angular/common';
import { FileService } from '../../../../../../core/services/file-service/file.service';
import { ChatbotBrainService } from '../../../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ChatbotChatMessageComponent } from '../chatbot-chat-message.component';

@Component({
  selector: 'app-chat-session-message-assistant',
  standalone: true,
  imports: [CommonModule, ChatSessionMessageVoteComponent],
  templateUrl: './chat-session-message-assistant.component.html',
  styleUrl: './chat-session-message-assistant.component.scss',
})
export class ChatSessionMessageAssistantComponent extends ChatbotChatMessageComponent {
  constructor(
      brain: ChatbotBrainService,
      override sanitizer: DomSanitizer,
      private readonly fileService: FileService) {
    super(brain, sanitizer);
  }

  get allowCopy(): boolean {
    return false;
  }

  vote(vote: string) {
    console.log("WIP Voted:", vote);
  }

  copyToClipboard() {
    console.log("WIP Coppied to clipboard:");
  }

  additionalAction() {
    console.log("WIP Pressed some other action:");
  }

  formatReference(document: any): string {
    const { doc_name, pages } = document;
    const formattedPages = pages && pages.length > 0 ? `: pag. ${pages.join(', ')}` : '';
    return `<strong>${doc_name}</strong>${formattedPages}`;
  }
  

  downloadDocument(docId: string) {
    this.fileService.referenceFileDownload(docId).subscribe({
      next: (message) => console.log(message),
      error: (err) => console.error(`Error downloading document: ${err}`),
    });
  }

  getMessageIdAsString() {
    return this.chatMessage?.id?.toString() || '';
  }
}
