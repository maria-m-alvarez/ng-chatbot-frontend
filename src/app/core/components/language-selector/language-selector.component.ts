import { Component, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization-service/localization.service';
import { Language } from '../../services/localization-service/localization.models';
import { CdkOverlayOrigin, CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, CdkOverlayOrigin, CdkConnectedOverlay],
  template: `
    <div class="relative inline-block">
      <!-- Dropdown BTN -->
      <button 
      cdkOverlayOrigin 
      #trigger="cdkOverlayOrigin"
      (click)="toggleDropdown()"
      class="px-4 py-2 flex items-center justify-center bg-inherit text-accent rounded-xl
      hover:border hover:border-accent"
      [ngClass]="{
      'w-32': useFullName, 
      'w-12': !useFullName,
      'border border-accent bg-secondary': dropdownOpen
      }">
        <span class="font-medium">
          {{ useFullName ? selectedLanguageName : selectedLanguage | uppercase }}
        </span>
      </button>

      <!-- CDK Overlay -->
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="dropdownOpen"
        [cdkConnectedOverlayHasBackdrop]="true"
        [cdkConnectedOverlayBackdropClass]="'cdk-overlay-transparent-backdrop'"
        [cdkConnectedOverlayPositions]="overlayPositions"
        [cdkConnectedOverlayPush]="true"
        [cdkConnectedOverlayFlexibleDimensions]="true"
        (backdropClick)="closeDropdown()">
        <div class="absolute z-50 mt-2 w-32 bg-secondary shadow-md rounded-md overflow-hidden
        text-primary">
          <ul class="">
            <li *ngFor="let lang of availableLanguages" 
                (click)="onLanguageChange(lang.code)" 
                class="px-4 py-2 cursor-pointer hover:bg-primary hover:text-secondary">
              {{ lang.name }}
            </li>
          </ul>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .cdk-overlay-transparent-backdrop {
      background: transparent !important;
      pointer-events: none;
    }
  `]
})
export class LanguageSelectorComponent implements AfterViewInit {
  @Input() useFullName: boolean = false;

  availableLanguages: Language[] = [];
  selectedLanguage: string = 'pt';
  selectedLanguageName: string = 'Português';
  dropdownOpen = false;

  // Position Strategy to prevent overlay from going off-screen
  overlayPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetX:-80 }, // Default below button
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }, // Flip above if needed
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' }, // Right align below
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' } // Right align above
  ];

  constructor(readonly localizationService: LocalizationService) {
    localizationService.onLanguagesLoaded.subscribe(() => {
      this.refreshLanguages();
    });
  }

  ngAfterViewInit() {
    this.refreshLanguages();
  }

  refreshLanguages() {
    this.availableLanguages = this.localizationService.getAvailableLanguages();
    this.selectedLanguage = localStorage.getItem('language') ?? 'pt';
    this.selectedLanguageName = this.getLanguageName(this.selectedLanguage);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  onLanguageChange(lang: string) {
    this.selectedLanguage = lang;
    this.selectedLanguageName = this.getLanguageName(lang);
    this.localizationService.setLanguage(lang);
    this.closeDropdown();
  }

  private getLanguageName(langCode: string): string {
    return this.availableLanguages.find(lang => lang.code === langCode)?.name ?? 'Unknown';
  }
}
