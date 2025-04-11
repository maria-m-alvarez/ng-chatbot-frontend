import { NgClass } from '@angular/common';
import { Component, ViewChild, ElementRef, HostListener, computed } from '@angular/core';
import { ChatbotBrainService } from '../../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ClientChatSession } from '../../../chatbot-models/chatbot-client-session';
import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ContextMenuItem, ContextMenuComponent } from '../../../../../lib/components/context-menu/context-menu.component';
import { AppState } from '../../../../../core/app-state';
import { TranslatePipe } from '../../../../../core/pipes/translate-pipe.pipe';
import { LocalizationKeys } from '../../../../../core/services/localization-service/localization.models';
import { LocalizationService } from '../../../../../core/services/localization-service/localization.service';

@Component({
  selector: 'app-chat-session-list',
  standalone: true,
  imports: [NgClass, OverlayModule, TranslatePipe],
  templateUrl: './chat-session-list.component.html',
  styleUrls: ['./chat-session-list.component.scss']
})
export class ChatSessionListComponent {
  chatSessions: ClientChatSession[] = [];
  editingSession: string | null = null;
  private overlayRef?: OverlayRef;
  private isContextMenuOpen = false;
  private translatePipe!: TranslatePipe;

  // Reactive Signals
  selectedSession = computed(() => AppState.activeChatSession());

  @ViewChild('sessionListContainer', { static: false }) containerRef!: ElementRef;

  constructor(
    public readonly brain: ChatbotBrainService,
    private readonly overlay: Overlay,    
    private readonly localizationService: LocalizationService
  ) {
    this.translatePipe = new TranslatePipe(this.localizationService);

    this.brain.chatbotEventService.onSessionListUpdated.subscribe(() => {
      console.log('Session list updated');
      this.chatSessions = this.brain.chatbotSessionService.sessions;
    });
  }

  isCurrentSession(sessionId: string): boolean {
    return AppState.activeChatSessionId() === sessionId;
  }

  selectSession(sessionId: string): void {
    if (this.editingSession) {
      return;
    }
    this.brain.chatbotSessionService.switchChatSession(sessionId);
  }

  onContextMenu(event: MouseEvent, session: ClientChatSession): void {
    event.preventDefault();
    event.stopPropagation();

    this.closeContextMenu();

    const menuItems: ContextMenuItem[] = [
      {
        id: 'edit',
        label: this.translatePipe.transform(LocalizationKeys.EDIT),
        icon: this.brain.iconService.icons.pencil,
        callback: () => this.enterEditMode(session)
      },
      {
        id: 'delete',
        label: this.translatePipe.transform(LocalizationKeys.DELETE),
        textClass: 'text-red-500',
        hoverBgClass: 'hover:bg-red-100',
        hoverTextClass: 'hover:text-red-700',
        icon: this.brain.iconService.icons.delete,
        callback: () => this.deleteSession(session)
      }
    ];

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({ x: event.clientX, y: event.clientY })
      .withPositions([{ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' }])
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
    if (!this.selectedSession()) {
      return;
    }
    this.closeContextMenu();
  }

  // ----------------------
  // Editing Behavior
  // ----------------------
  enterEditMode(session: ClientChatSession): void {
    this.editingSession = session.sessionId;
    this.closeContextMenu();
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
