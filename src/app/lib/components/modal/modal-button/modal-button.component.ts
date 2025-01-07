import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ModalConfig, ModalFullscreenComponent } from "../modal-fullscreen/modal-fullscreen.component";
import { NgTemplateOutlet } from '@angular/common';
import { ToggleableComponent } from '../../../toggleable/toggleable-component';
import { ToggleService } from '../../../toggleable/toggleable.service';

export interface BtnWithModalConfig {
  componentId: string;
  modalConfig: ModalConfig;
}

@Component({
    selector: 'app-modal-button',
    standalone: true,
    imports: [NgTemplateOutlet, ModalFullscreenComponent],
    templateUrl: './modal-button.component.html',
    styleUrl: './modal-button.component.scss'
})
export class ModalButtonComponent implements ToggleableComponent {
  @Input() config: BtnWithModalConfig = {componentId: '', modalConfig: {componentId: '', title: '', optionToListenFor: '', isSubmitEnabled: false}};
  @Input() btnTemplate!: TemplateRef<any>;
  @Input() modalTemplate!: TemplateRef<any>;

  @Output() stateChange = new EventEmitter<boolean>(); // Emit the state change

  @ViewChild(ModalFullscreenComponent) modal!: ModalFullscreenComponent;
  isOpen = false;

  get componentId(): string {
    return this.config.componentId;
  }

  constructor(private readonly toggleService: ToggleService) {}

  ngOnInit(): void {
    this.toggleService.registerComponent(this);
  }

  ngOnDestroy(): void {
    this.toggleService.unregisterComponent(this.componentId);
  }

  open(): void {
    this.toggleService.open(this.componentId);
    this.isOpen = true;
    this.stateChange.emit(this.isOpen); // Emit the state change
    console.log(`Modal "${this.config.modalConfig.title}" opened.`);
  }

  close(): void {
    this.isOpen = false;
    this.stateChange.emit(this.isOpen); // Emit the state change
    console.log(`Modal "${this.config.modalConfig.title}" closed.`);
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.stateChange.emit(this.isOpen); // Emit the state change
    console.log(`Modal "${this.config.modalConfig.title}" toggled to ${this.isOpen ? 'open' : 'closed'}.`);
  }
}
