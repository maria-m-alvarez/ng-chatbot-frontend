import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../services/event-service/event.service';

export interface ModalConfig {
  title: string;
  optionToListenFor: string;
  isSubmitEnabled: boolean;
}

@Component({
  selector: 'app-modular-modal',
  standalone: true,
  templateUrl: './modular-modal.component.html',
  styleUrls: ['./modular-modal.component.scss'],
  imports: [CommonModule]
})
export class ModularModalComponent {
  @Input() modalConfig: ModalConfig = {
    title: 'Blank Modal',
    optionToListenFor: 'settings',
    isSubmitEnabled: true
  };

  @ContentChild(TemplateRef) customContent!: TemplateRef<any>;

  isOpen = false;

  constructor(protected readonly eventService: EventService) {}

  ngOnInit(): void {
    this.eventService
      .userOptionsClickEvt
      .subscribe((eventId: string) => this.filterEvent(eventId));
  }

  protected filterEvent(eventId: string) {
    if (eventId === this.modalConfig.optionToListenFor) {
      this.openModal();
    }
  }

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  submit() {
    console.log(`${this.modalConfig.title}, for: ${this.modalConfig.optionToListenFor}, had its submit button clicked.`);
    this.closeModal();
  }
}
