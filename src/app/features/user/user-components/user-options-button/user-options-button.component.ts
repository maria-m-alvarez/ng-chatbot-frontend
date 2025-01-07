import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserSettingsModalComponent } from "../user-settings-modal/user-settings-modal.component";
import { ThemeToggleComponent } from '../../../../core/components/theme-toggle/theme-toggle.component';
import { EventService } from '../../../../core/services/event-service/event.service';
import { ThemeService } from '../../../../core/services/theme-service/theme.service';
import { AuthService } from '../../../authentication/auth-service/auth.service';
import { ToggleService } from '../../../../lib/toggleable/toggleable.service';

@Component({
  selector: 'app-user-options-button',
  standalone: true,
  imports: [ThemeToggleComponent, UserSettingsModalComponent],
  templateUrl: './user-options-button.component.html',
  styleUrls: ['./user-options-button.component.scss']
})
export class UserOptionsButtonComponent {
  isDropdownOpen = false;

  constructor(
    readonly toggleService: ToggleService,
    readonly themeService: ThemeService,
    readonly eventService: EventService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  triggerOptionEvent(eventId: string) {
    this.eventService.userOptionsClickEvt.emit(eventId);
    if (eventId === 'logout') {
      this.logout();
    }
    this.isDropdownOpen = false;
  }

  openUserSettings() {
    this.toggleService.open('user-settings-modal');
  }

  logout() {
    this.authService.logout(); // Clear auth tokens or session data
    this.router.navigate(['/auth/login']); // Redirect to login page
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isDropdownOpen = false;
    }
  }
}
