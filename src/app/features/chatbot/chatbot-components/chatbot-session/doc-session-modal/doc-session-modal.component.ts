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

  // (1) Click-to-Upload
  onFileSelected(event: any): void {
    const selectedFiles = event.target.files as FileList;
    
    if (selectedFiles && selectedFiles.length) {
      for (let i = 0; i < selectedFiles.length; i++) {
        this.files.push(selectedFiles.item(i)!);
      }
    }

    // Reset the file input to allow re-selecting the same file
    event.target.value = ''; 
  }

  onRemoveFile(index: number): void {
    this.files.splice(index, 1);

    // Reset file input field to reflect the updated number of files
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
}

  // (2) Drag-and-Drop
  @HostListener('document:dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = true;
  }

  @HostListener('document:dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    // If leaving the window entirely => reset
    if (event.screenX === 0 && event.screenY === 0) {
      this.isDraggingOver = false;
    }
  }

  @HostListener('document:drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        this.files.push(event.dataTransfer.files.item(i)!);
      }
      event.dataTransfer.clearData();
    }
  }

  // Called when user submits the modal form
  onSubmit(): void {
    if (this.sessionForm.invalid) {
      return;
    }

    const { name } = this.sessionForm.value;

    this.sessionService.createDocSessionWithFiles(name, this.files).subscribe({
      next: (session: ChatSession) => {
        console.log('New doc session created with files:', session);
        this.overlayRef.dispose();
      },
      error: (error) => {
        console.error('Error creating doc session with files:', error);
      }
    });
  }

  onClose(): void {
    this.overlayRef.dispose();
  }
}
