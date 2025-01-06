import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { FileService } from '../../../../../core/services/file-service/file.service';

@Component({
  selector: 'app-chatbot-input-attachment',
  standalone: true,
  templateUrl: './chatbot-input-attachment.component.html',
  styleUrls: ['./chatbot-input-attachment.component.scss'],
})
export class ChatbotInputAttachmentComponent {
  @Input() file!: File;
  @Output() remove = new EventEmitter<void>();
  fileIcon: SafeHtml | null = null;

  constructor(private readonly fileService: FileService) {}

  ngOnInit(): void {
    this.fileIcon = this.fileService.getFileIcon(this.file);
  }

  removeFile(): void {
    this.remove.emit();
  }
}
