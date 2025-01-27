import { Component, ElementRef, HostListener, ViewChild, Signal } from '@angular/core';
import { ChatbotInputAttachmentComponent } from "../chatbot-input-attachment/chatbot-input-attachment.component";
import { ChatbotBrainService } from '../../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ChatbotSettingsComponent } from "../../chatbot-settings/chatbot-settings.component";
import { NgStyle } from '@angular/common';
import { WebRequestResult } from '../../../../../core/models/enums';
import { environment } from '../../../../../../environments/environment';
import { AppState } from '../../../../../core/app-state';
import { ChatSessionInteractionState } from '../../../chatbot-models/chatbot-enums';
import { LocalizationKeys } from '../../../../../core/services/localization-service/localization.models';
import { TranslatePipe } from "../../../../../core/pipes/translate-pipe.pipe";

@Component({
  selector: 'app-chatbot-input',
  standalone: true,
  templateUrl: './chatbot-input.component.html',
  styleUrls: ['./chatbot-input.component.scss'],
  imports: [NgStyle, ChatbotInputAttachmentComponent, ChatbotSettingsComponent, TranslatePipe]
})
export class ChatbotInputComponent {
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLDivElement>;
  @ViewChild('chatTextInput') chatTextInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public readonly chatbotInputStates = ChatSessionInteractionState;
  get currentInputState(): ChatSessionInteractionState {
    return AppState.chatSessionInteractionState();
  }

  files: File[] = [];
  dragCounter = 0;
  inputText: string = '';
  errorMessage: string | null = null;
  countdownWidth: number = 100;
  countdownInterval: any = null;
  isRunningCountdown: boolean = false;

  allowFileUpload = environment.allowFileUpload;

  LocalizationKeys = LocalizationKeys;

  constructor(readonly brain: ChatbotBrainService) {
    brain.chatbotEventService.onPromptAnswerReceived.subscribe((result) => {
      AppState.updateChatSessionInteractionState(ChatSessionInteractionState.Idle);

      if (result == WebRequestResult.Error) {
        this.displayErrorMessage('Houve um erro a processar a sua resposta. Por favor, tente novamente.');
        AppState.updateChatSessionInteractionState(ChatSessionInteractionState.Error);
      }
    });
  }

  ngAfterViewInit() {
    if (this.chatTextInput) {
      this.chatTextInput.nativeElement.value = '';
    }
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    this.inputText = textarea.value;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitMessage();
    }
  }

  submitMessage(): void {
    const message = this.chatTextInput?.nativeElement.value.trim();
    if (message) {
      this.brain.chatbotSessionService.sendChatMessageForCurrentChatSession(message);

      if (this.files.length > 0) {
        this.brain.chatbotSessionService.handleFiles(this.files);
      }
      
      this.chatTextInput.nativeElement.value = '';
      this.chatTextInput.nativeElement.style.height = 'auto';

      this.inputText = '';
      this.clearFiles();
    }
  }

  openFileSelector(): void {
    this.fileInput.nativeElement.click();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleDroppedFiles(input.files);
    }
  }

  /** Drag & Drop File Handling */
  @HostListener('document:dragenter', ['$event'])
  onDragEnter(event: DragEvent): void {
    this.dragCounter++;
    if (event.dataTransfer?.types.includes('Files')) {
      AppState.updateChatSessionInteractionState(ChatSessionInteractionState.Dragging);
    }
  }

  @HostListener('document:dragleave', ['$event'])
  onDragLeave(): void {
    this.dragCounter--;
    if (this.dragCounter === 0) {
      AppState.updateChatSessionInteractionState(ChatSessionInteractionState.Idle);
    }
  }

  @HostListener('document:dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  @HostListener('document:drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragCounter = 0;
    AppState.updateChatSessionInteractionState(ChatSessionInteractionState.Idle);
    console.log('Drop detected.');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      console.log(`Files detected: ${files.length}`);
      Array.from(files).forEach(file =>
        console.log(`File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`)
      );
      this.handleDroppedFiles(files);
    } else {
      console.warn('No files detected on drop.');
    }
  }

  handleDroppedFiles(files: FileList): void {
    console.log('Handling dropped files...');
    Array.from(files).forEach(file => {
      const isDuplicate = this.files.some(existingFile => existingFile.name === file.name);
      if (!isDuplicate) {
        console.log(`Adding file: ${file.name}`);
        this.files.push(file);
      } else {
        console.warn(`Duplicate file ignored: ${file.name}`);
      }
    });
    console.log('Current files:', this.files);
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  clearFiles(): void {
    this.files = [];
  }

  refreshInputText(): void {
    if (!this.chatTextInput) {
      console.error('Chat text input element not found');
    }

    const textarea = this.chatTextInput.nativeElement;
    textarea.value = this.inputText;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }
  
  displayErrorMessage(message: string): void {
    if (!this.isRunningCountdown) {
      this.clearErrorMessage();
    }

    this.errorMessage = message;
    this.startCountdown();
  }

  startCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    this.countdownWidth = 100;
    const intervalStep = 5000 / 100; 

    this.countdownInterval = setInterval(() => {
      this.isRunningCountdown = true;
      this.countdownWidth -= 1;

      if (this.countdownWidth <= 0) {
        this.clearErrorMessage();
      }
    }, intervalStep);
  }

  clearErrorMessage(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.errorMessage = null;
    this.countdownWidth = 100;
    this.isRunningCountdown = false;
  }

  stopProcessing() {
    this.brain.chatbotSessionService.stopProcessing();
  }
}
