import { Component, Input, TemplateRef, OnInit, OnDestroy, Renderer2, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { ToggleableComponent } from '../../../toggleable/toggleable-component';
import { ToggleService } from '../../../toggleable/toggleable.service';

export interface ModalConfig {
  componentId: string;
  title: string;
  optionToListenFor: string;
  isSubmitEnabled: boolean;
}

@Component({
  selector: 'app-modal-fullscreen',
  templateUrl: './modal-fullscreen.component.html',
  styleUrls: ['./modal-fullscreen.component.scss'],
  standalone: true,
  imports: [NgTemplateOutlet, CommonModule],
})
export class ModalFullscreenComponent implements ToggleableComponent, OnInit, OnDestroy {
  @Input() modalConfig: ModalConfig = {
    componentId: 'modal-fullscreen',
    title: 'Blank Modal',
    optionToListenFor: 'settings',
    isSubmitEnabled: true,
  };

  @Input() modalTemplate!: TemplateRef<any>;
  @Output() onStateChange = new EventEmitter<boolean>();

  isOpen = false;
  private modalElement!: HTMLElement;

  get componentId(): string {
    return this.modalConfig.componentId;
  }

  constructor(
    private readonly toggleService: ToggleService,
    private readonly renderer: Renderer2,
    private readonly elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.toggleService.registerComponent(this);

    // Move the modal container to the body
    const modalDiv = this.elRef.nativeElement.querySelector('.modal-container');
    if (modalDiv) {
      this.modalElement = modalDiv;
      this.renderer.appendChild(document.body, modalDiv);
    }
  }

  ngOnDestroy(): void {
    this.toggleService.unregisterComponent(this.componentId);
    // Remove the modal container from the body
    if (this.modalElement) {
      this.renderer.removeChild(document.body, this.modalElement);
    }
  }

  open(): void {
    this.isOpen = true;
    this.renderer.setStyle(this.modalElement, 'display', 'flex');
    console.log(`Modal "${this.modalConfig.title}" opened.`);
    this.emitStateChange();
  }

  close(): void {
    this.isOpen = false;
    this.renderer.setStyle(this.modalElement, 'display', 'none');
    console.log(`Modal "${this.modalConfig.title}" closed.`);
    this.emitStateChange();
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
    console.log(`Modal "${this.modalConfig.title}" toggled to ${this.isOpen ? 'open' : 'closed'}.`);
  }

  submit(): void {
    console.log(`${this.modalConfig.title} submit button clicked.`);
    this.close();
  }

  private emitStateChange(): void {
    this.onStateChange.emit(this.isOpen);
  }
}
