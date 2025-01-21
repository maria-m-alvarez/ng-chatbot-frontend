import { NgClass } from '@angular/common';
import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ChatbotBrainService } from '../../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ClientChatSession } from '../../../chatbot-models/chatbot-client-session';
import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ContextMenuItem, ContextMenuComponent } from '../../../../../lib/components/context-menu/context-menu.component';
import { IconService } from '../../../../../core/services/icon-service/icon.service';

@Component({
  selector: 'app-chat-session-list',
  standalone: true,
  imports: [NgClass, OverlayModule],
  templateUrl: './chat-session-list.component.html',
  styleUrls: ['./chat-session-list.component.scss']
})
export class ChatSessionListComponent {
  chatSessions: ClientChatSession[] = [];
  selectedSession: ClientChatSession | null = null;
  editingSession: string | null = null; // Track which session is being edited
  private overlayRef?: OverlayRef;
  private isContextMenuOpen = false;

  @ViewChild('sessionListContainer', { static: false }) containerRef!: ElementRef;

  constructor(
    public readonly brain: ChatbotBrainService,
    private readonly overlay: Overlay,
    private readonly iconService: IconService
  ) {
    this.brain.chatbotEventService.onSessionListUpdated.subscribe(() => {
      this.chatSessions = this.brain.chatbotSessionService.sessions;
    });
  }

  isCurrentSession(sessionId: string): boolean {
    return this.brain.chatbotSessionService.currentSession?.sessionId === sessionId;
  }

  selectSession(sessionId: string): void {
    this.brain.chatbotSessionService.switchChatSession(sessionId);
  }

  onContextMenu(event: MouseEvent, session: ClientChatSession): void {
    event.preventDefault();
    event.stopPropagation();

    this.closeContextMenu();

    const menuItems: ContextMenuItem[] = [
      {
        id: 'edit',
        label: 'Edit',
        icon: this.iconService.icons.pencil,
        callback: () => this.enterEditMode(session)
      },
      {
        id: 'delete',
        label: 'Delete',
        textClass: 'text-red-500',
        hoverBgClass: 'hover:bg-red-100',
        hoverTextClass: 'hover:text-red-700',
        icon: this.iconService.icons.delete,
        callback: () => this.deleteSession(session)
      }
    ];

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({ x: event.clientX, y: event.clientY })
      .withPositions([
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' }
      ])
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    const portal = new ComponentPortal(ContextMenuComponent);
    const componentRef = this.overlayRef.attach(portal);
    componentRef.instance.items = menuItems;

    this.overlayRef.backdropClick().subscribe(() => this.closeContextMenu());

    this.isContextMenuOpen = true;
    document.addEventListener('keydown', this.handleEscapeKey);
  }

  closeContextMenu(): void {
    this.overlayRef?.dispose();
    this.isContextMenuOpen = false;
    document.removeEventListener('keydown', this.handleEscapeKey);
  }

  private readonly handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.isContextMenuOpen) {
      this.closeContextMenu();
    }
  };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.selectedSession) {
      return;
    }
    this.closeContextMenu();
  }

  // ----------------------
  // Editing Behavior
  // ----------------------
  enterEditMode(session: ClientChatSession): void {
    this.editingSession = session.sessionId;
    this.closeContextMenu(); // Close the context menu when entering edit mode
  }

  updateSessionName(session: ClientChatSession, newName: string): void {
    if (newName.trim() && newName !== session.name) {
      session.name = newName;
      this.brain.chatbotSessionService.renameSession(session.sessionId, newName);
    }
    this.editingSession = null;
  }

  cancelEditing(): void {
    this.editingSession = null;
  }

  deleteSession(session: ClientChatSession): void {
    const confirmDelete = confirm(`Are you sure you want to delete "${session.name}"?`);
    if (confirmDelete) {
      this.brain.chatbotSessionService.deleteSession(session.sessionId);
      this.chatSessions = this.chatSessions.filter(s => s.sessionId !== session.sessionId);
    }
  }
}
