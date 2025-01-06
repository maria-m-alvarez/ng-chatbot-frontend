import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ChatbotInputAttachmentComponent } from "../chatbot-input-attachment/chatbot-input-attachment.component";
import { ChatbotBrainService } from '../../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ChatbotInputOptionsComponent } from "../chatbot-input-options/chatbot-input-options.component";
import { ChatbotSettingsComponent } from "../../chatbot-settings/chatbot-settings.component";
import { NgStyle } from '@angular/common';
import { WebRequestResult } from '../../../../../core/models/enums';

@Component({
  selector: 'app-chatbot-input',
  standalone: true,
  templateUrl: './chatbot-input.component.html',
  styleUrls: ['./chatbot-input.component.scss'],
  imports: [NgStyle, ChatbotInputAttachmentComponent, ChatbotInputOptionsComponent, ChatbotSettingsComponent]
})
export class ChatbotInputComponent {
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLDivElement>;
  @ViewChild('chatTextInput') chatTextInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public readonly chatbotInputStates = ChatbotBrainService.chatbotInputStates;

  currentInputState: string = this.chatbotInputStates.Idle;
  files: File[] = [];
  dragCounter = 0;
  inputText: string = '';
  errorMessage: string | null = null;
  countdownMinWidth: number = 4;
  countdownWidth: number = 100;
  countdownDuration: number = 5000;
  countdownInterval: any = null;
  isRunningCountdown: boolean = false;

  constructor(readonly brain: ChatbotBrainService) {
    brain.chatbotEventService.onPromptAnswerReceived.subscribe((result) => {
      this.changeInputState(this.chatbotInputStates.Idle);

      if (result == WebRequestResult.Error) {
        this.displayErrorMessage('Houve um erro a processar a sua resposta. Por favor, tente novamente.');
      }
    });
  }

  ngAfterViewInit() {
    if (this.chatTextInput) {
      this.chatTextInput.nativeElement.value = '';
    }
  }

  changeInputState(state: string): void {
    if (state === this.currentInputState) {
      return;
    }
    this.currentInputState = state;
    this.brain.chatbotEventService.onChatbotInputStateChanged.emit(state);
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
      this.brain.chatbotSessionService.sendMessage(message);
      this.changeInputState(this.chatbotInputStates.Waiting);

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

  @HostListener('document:dragenter', ['$event'])
  onDragEnter(event: DragEvent): void {
    this.dragCounter++;
    if (event.dataTransfer?.types.includes('Files')) {
      this.changeInputState(this.chatbotInputStates.Dragging);
    }
  }

  @HostListener('document:dragleave', ['$event'])
  onDragLeave(): void {
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.changeInputState(this.chatbotInputStates.Idle);
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
    this.changeInputState(this.chatbotInputStates.Idle);
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

  private isDroppedOnInput(event: DragEvent): boolean {
    const target = event.target as HTMLElement;
    return this.chatInput.nativeElement.contains(target);
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
  
  // Display the error message and start the countdown
  displayErrorMessage(message: string): void {
    if (!this.isRunningCountdown) {
      this.clearErrorMessage(); // Reset any ongoing error countdowns
    }

    this.errorMessage = message;
    this.startCountdown();
  }

  // Start the countdown for the error message
  startCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    this.countdownWidth = 100;
    this.countdownDuration = 5000; // Total duration (5 seconds)

    const steps = 100; // Number of steps (width percentage)
    const intervalStep = this.countdownDuration / steps; // Interval in milliseconds for each step

    this.countdownInterval = setInterval(() => {
      this.isRunningCountdown = true;
      this.countdownWidth -= 1;

      if (this.countdownWidth <= 0) {
        this.clearErrorMessage(); // Clear the message when countdown finishes
      }
    }, intervalStep);
  }

  // Clear the error message and stop the countdown
  clearErrorMessage(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval); // Stop any ongoing interval
      this.countdownInterval = null;
    }
    this.errorMessage = null; // Reset the error message
    this.countdownWidth = 100; // Immediately reset the width to full
    this.isRunningCountdown = false;
  }

  stopProcessing() {
    this.brain.chatbotSessionService.stopProcessing();
  }
}
