import { 
  Component, 
  Input, 
  TemplateRef, 
  ViewContainerRef, 
  OnDestroy 
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { IconService } from '../../../core/services/icon-service/icon.service';

export interface ContextMenuItem {
  id: string | number;
  label: string;
  callback: () => void;
  icon?: string;
  bgClass?: string;
  textClass?: string;
  hoverBgClass?: string;
  hoverTextClass?: string;
}

export interface ContextMenuStrategy {
  positionStrategy?: (overlay: Overlay, x: number, y: number) => any;
  backdropClass?: string;
}

@Component({
  standalone: true,
  imports: [ NgClass, NgTemplateOutlet, PortalModule ],
  selector: 'app-context-menu',
  template: `
    <div class="bg-white shadow-lg rounded-xl p-2 w-48 z-50">
      @for (item of items; track item.id) {
        <div 
          class="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition"
          [ngClass]="[
            item.bgClass || 'bg-white',
            item.textClass || 'text-gray-700',
            item.hoverBgClass || 'hover:bg-gray-100',
            item.hoverTextClass || 'hover:text-black'
          ]"
          (click)="$event.preventDefault(); onItemClick(item)"
        >
          @if (itemTemplate) {
            <ng-container
              [ngTemplateOutlet]="itemTemplate"
              [ngTemplateOutletContext]="{ $implicit: item }"
            ></ng-container>
          } @else {
            @if(item.icon) {
              <div [innerHTML]="iconService.getSanitizedIcon(item.icon)" class="w-6 h-6 flex items-center"> </div>
            }
            <span>{{ item.label }}</span>
          }
        </div>
      }
    </div>
  `
})
export class ContextMenuComponent implements OnDestroy {
  @Input() items: ContextMenuItem[] = [];
  @Input() itemTemplate?: TemplateRef<any>;
  @Input() strategy?: ContextMenuStrategy; 
  @Input() xOffset: number = 0;
  @Input() yOffset: number = 0;

  private overlayRef?: OverlayRef;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    readonly iconService: IconService
  ) {}

  open(x: number, y: number, xOffset: number = 0, yOffset: number = 0): void {
    this.close(); // Ensure previous overlay is disposed before opening a new one

    const adjustedX = x + xOffset;
    const adjustedY = y + yOffset;

    const positionStrategy = this.strategy?.positionStrategy
      ? this.strategy.positionStrategy(this.overlay, adjustedX, adjustedY)
      : this.overlay.position().global().left(`${adjustedX}px`).top(`${adjustedY}px`);

    // 🔥 Fix: Set width and height in OverlayConfig instead of using deprecated methods
    const overlayConfig: OverlayConfig = {
      positionStrategy,
      hasBackdrop: true,
      backdropClass: this.strategy?.backdropClass || 'cdk-overlay-backdrop',
      panelClass: 'context-menu-panel', // Custom class to style the panel if needed
      width: '100vw', // ✅ Full viewport width
      height: '100vh' // ✅ Full viewport height
    };

    this.overlayRef = this.overlay.create(overlayConfig);

    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });

    // Attach menu component inside overlay
    const portal = new ComponentPortal(ContextMenuComponent, this.viewContainerRef);
    const componentRef = this.overlayRef.attach(portal);

    // Pass data to the dynamically created instance
    componentRef.instance.items = this.items;
    componentRef.instance.itemTemplate = this.itemTemplate;
    componentRef.instance.strategy = this.strategy;
    componentRef.instance.xOffset = xOffset;
    componentRef.instance.yOffset = yOffset;
  }

  close(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }

  onItemClick(item: ContextMenuItem): void {
    item.callback();
    this.close();
  }

  ngOnDestroy(): void {
    this.close();
  }
}
