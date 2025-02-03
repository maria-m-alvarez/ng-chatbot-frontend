import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { ChatbotApiService } from '../../../chatbot-services/chatbot-api/chatbot-api.service';
import { LocalizationKeys } from '../../../../../core/services/localization-service/localization.models';
import { TranslatePipe } from '../../../../../core/pipes/translate-pipe.pipe';

@Component({
  selector: 'app-doc-session-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './doc-session-modal.component.html',
  styleUrls: ['./doc-session-modal.component.scss']
})
export class DocSessionModalComponent implements OnInit {
  sessionForm!: FormGroup;
  files: File[] = [];
  isDraggingOver = false;
  overlayRef!: OverlayRef;
  
  LanguageKeys = LocalizationKeys;

  constructor(
    private fb: FormBuilder,
    private chatbotApi: ChatbotApiService
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
  }

  onRemoveFile(index: number): void {
    this.files.splice(index, 1);
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
      return; // or display an error
    }

    const { name } = this.sessionForm.value;

    // Call the service method to create doc session + files
    this.chatbotApi.createDocSessionWithFiles(name, this.files).subscribe({
      next: (response) => {
        console.log('New session created with files:', response);
        this.overlayRef.dispose();
      },
      error: (error) => {
        console.error('Error creating session with files:', error);
      }
    });
  }

  onClose(): void {
    this.overlayRef.dispose();
  }
}
