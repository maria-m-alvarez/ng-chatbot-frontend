import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  TemplateRef, 
  ViewContainerRef, 
  OnDestroy 
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { CommonModule, NgTemplateOutlet } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, PortalModule],
  selector: 'app-confirmation-modal',
  template: `
    <div class="bg-white p-6 rounded-xl shadow-lg w-[300px] sm:w-[400px]">
      @if(headerTemplate) {
        <ng-container [ngTemplateOutlet]="headerTemplate"></ng-container>
      } @else {
        <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
      }

      @if (bodyTemplate) {
        <ng-container [ngTemplateOutlet]="bodyTemplate"></ng-container>
      } @else {
        <p>{{ message }}</p>
      }

      <div class="flex justify-end mt-6 space-x-2">
        <button 
          class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          (click)="onCancel()"
        >
          Cancel
        </button>
        <button 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          (click)="onConfirm()"
        >
          Confirm
        </button>
      </div>
    </div>
  `
})
export class ConfirmationModalComponent implements OnDestroy {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure?';
  @Input() headerTemplate?: TemplateRef<any>;
  @Input() bodyTemplate?: TemplateRef<any>;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private overlayRef?: OverlayRef;

  constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {}

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  open(): void {
    this.close();

    const positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'bg-gray-900 bg-opacity-50',
      positionStrategy
    });

    this.overlayRef.backdropClick().subscribe(() => this.close());

    const portal = new ComponentPortal(ConfirmationModalComponent, this.viewContainerRef);
    const componentRef = this.overlayRef.attach(portal);

    componentRef.instance.title = this.title;
    componentRef.instance.message = this.message;
    componentRef.instance.headerTemplate = this.headerTemplate;
    componentRef.instance.bodyTemplate = this.bodyTemplate;
    
    componentRef.instance.confirm.subscribe(() => {
      this.confirm.emit();
      this.close();
    });

    componentRef.instance.cancel.subscribe(() => {
      this.cancel.emit();
      this.close();
    });
  }

  close(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }

  ngOnDestroy(): void {
    this.close();
  }
}
