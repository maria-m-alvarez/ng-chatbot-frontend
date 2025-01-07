import {
  Component,
  ContentChild,
  ElementRef,
  HostListener,
  Input,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { trigger, state, style, transition, animate, AnimationEvent } from '@angular/animations';
import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ToggleableComponent } from '../../toggleable/toggleable-component';
import { ToggleService } from '../../toggleable/toggleable.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [NgClass, NgStyle, NgTemplateOutlet],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    animations: [
        trigger('sidebarState', [
            state('openLeft', style({
                transform: 'translateX(0)',
                width: '{{openWidth}}',
            }), { params: { openWidth: '250px' } }),
            state('closedLeft', style({
                transform: 'translateX(-100%)',
                width: '0',
            })),
            state('openRight', style({
                transform: 'translateX(0)',
                width: '{{openWidth}}',
            }), { params: { openWidth: '250px' } }),
            state('closedRight', style({
                transform: 'translateX(100%)',
                width: '0',
            })),
            transition('closedLeft <=> openLeft', [animate('200ms ease-in-out')]),
            transition('closedRight <=> openRight', [animate('200ms ease-in-out')]),
        ]),
    ]
})
export class SidebarComponent implements ToggleableComponent, AfterViewInit, OnDestroy {
  @Input() componentId!: string;
  @Input() isResizable: boolean = false;
  @Input() isCollapsible: boolean = false;
  @Input() position: 'left' | 'right' = 'left';
  @Input() openWidth: string = '250px';
  @Input() minWidth: string = '16px';
  @Input() maxWidth: string = '400px';
  @Input() minCloseWidth: string = '50px';

  @ContentChild(TemplateRef) content!: TemplateRef<any>;
  @ViewChild('sidebar', { static: false }) sidebarRef!: ElementRef;
  @ViewChild('resizer', { static: false }) resizerRef!: ElementRef;

  iconArrowRight: string = `
  <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
  </svg>`;

  iconArrowLeft: string = `
    <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>`;

  isOpen = false;
  isResizing = false;
  isAnimating = false;
  currentWidth: number = 250;
  private startMouseX: number = 0; // Starting X position of the mouse

  constructor(
    protected readonly sanitizer: DomSanitizer,
    protected readonly toggleService: ToggleService
  ) {}

  ngAfterViewInit(): void {
    this.currentWidth = this.parseWidth(this.openWidth);
    this.toggleService.registerComponent(this);
  }

  ngOnDestroy(): void {
    this.toggleService.unregisterComponent(this.componentId);
    this.stopResizing();
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.stopResizing();
    this.isOpen = false;
    this.currentWidth = 0;
  }

  toggle(): void {
    this.isAnimating = true; // Start animation
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.currentWidth = 0;
    } else {
      this.currentWidth = this.parseWidth(this.openWidth);
    }
  }

  onAnimationEvent(event: AnimationEvent): void {
    if (event.phaseName === 'start') {
      this.isAnimating = true;
    } else if (event.phaseName === 'done') {
      this.isAnimating = false;
    }
  }

  get toggleIcon(): SafeHtml {
    const icon = this.isOpen
      ? this.position === 'left'
        ? this.iconArrowLeft
        : this.iconArrowRight
      : this.position === 'left'
      ? this.iconArrowRight
      : this.iconArrowLeft;
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isResizable && target === this.resizerRef.nativeElement) {
      this.isResizing = true;
      this.startMouseX = event.clientX; // Capture starting X position

      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';

      document.addEventListener('mousemove', this.resizeSidebar);
      document.addEventListener('mouseup', this.stopResizing);
    }
  }

  private resizeSidebar = (event: MouseEvent): void => {
    if (!this.isResizing || !this.sidebarRef) return;

    const sidebar = this.sidebarRef.nativeElement;
    const parentWidth = this.getParentWidth();
    const offsetWidth = this.resizerRef.nativeElement.offsetWidth * 0.5 || 0;

    // Calculate the new width based on the mouse position, including the offset
    const newWidth = this.position === 'left'
      ? event.clientX - sidebar.getBoundingClientRect().left + offsetWidth
      : sidebar.getBoundingClientRect().right - event.clientX + offsetWidth;

    // Ensure the new width is within the allowed bounds
    if (newWidth < this.parseWidth(this.minCloseWidth, parentWidth) && this.isCollapsible) {
      this.close();
    } else {
      const boundedWidth = Math.max(
        this.parseWidth(this.minWidth, parentWidth),
        Math.min(newWidth, this.parseWidth(this.maxWidth, parentWidth))
      );

      this.currentWidth = boundedWidth;
      sidebar.style.width = `${boundedWidth}px`;
    }
  };

  private stopResizing = (): void => {
    if (!this.isResizing) return;

    this.isResizing = false;
    this.startMouseX = 0; // Reset starting mouse position
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    document.removeEventListener('mousemove', this.resizeSidebar);
    document.removeEventListener('mouseup', this.stopResizing);
  };

  private parseWidth(width: string, parentWidth: number = this.getParentWidth()): number {
    if (width.endsWith('%')) {
      return (parseFloat(width) / 100) * parentWidth;
    }
    return parseFloat(width);
  }

  private getParentWidth(): number {
    return this.sidebarRef.nativeElement.parentElement.clientWidth;
  }

  get animationState(): { value: string; params: { openWidth: string } } {
    return {
      value: this.isOpen
        ? `open${this.position.charAt(0).toUpperCase()}${this.position.slice(1)}`
        : `closed${this.position.charAt(0).toUpperCase()}${this.position.slice(1)}`,
      params: { openWidth: `${this.currentWidth}px` },
    };
  }
}
