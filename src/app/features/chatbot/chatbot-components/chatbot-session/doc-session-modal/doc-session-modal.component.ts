import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChatbotApiService } from '../../../chatbot-services/chatbot-api/chatbot-api.service';
import { LocalizationKeys } from '../../../../../core/services/localization-service/localization.models';
import { TranslatePipe } from '../../../../../core/pipes/translate-pipe.pipe';
import { ChatbotSessionService } from '../../../chatbot-services/chatbot-session/chatbot-session.service';
import { ChatSession } from '../../../chatbot-models/chatbot-api-response-models';

@Component({
  selector: 'app-doc-session-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './doc-session-modal.component.html',
  styleUrls: ['./doc-session-modal.component.scss']
})
export class DocSessionModalComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  sessionForm!: FormGroup;
  files: File[] = [];
  isDraggingOver = false;
  isProcessing = false;
  overlayRef!: OverlayRef;
  
  LanguageKeys = LocalizationKeys;

  constructor(
    private readonly fb: FormBuilder,
    private readonly chatbotApi: ChatbotApiService,
    private readonly sessionService: ChatbotSessionService
  ) {}

  ngOnInit(): void {
    this.sessionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  // File Upload Handling
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.files.push(...Array.from(target.files));
      target.value = ''; // Reset input
    }
  }

  onRemoveFile(index: number): void {
    this.files.splice(index, 1);
    if (this.fileInput) this.fileInput.nativeElement.value = ''; // Reset input
  }

  // Drag-and-Drop Handling
  @HostListener('document:dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = true;
  }

  @HostListener('document:dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    if (event.screenX === 0 && event.screenY === 0) {
      this.isDraggingOver = false;
    }
  }

  @HostListener('document:drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = false;
    if (event.dataTransfer?.files) {
      this.files.push(...Array.from(event.dataTransfer.files));
      event.dataTransfer.clearData();
    }
  }

  // Form Submission
  async onSubmit(): Promise<void> {
    if (this.sessionForm.invalid) return;

    this.isProcessing = true; // Start animation

    try {
      const { name } = this.sessionForm.value;
      const session = await this.sessionService.createDocSessionWithFiles(name, this.files).toPromise();
      console.log('New doc session created:', session);
      this.overlayRef.dispose();
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      this.isProcessing = false; // Stop animation
    }
  }

  onClose(): void {
    this.overlayRef.dispose();
  }
}
