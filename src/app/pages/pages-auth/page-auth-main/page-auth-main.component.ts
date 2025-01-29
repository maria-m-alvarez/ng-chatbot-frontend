import { Component, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModularHeaderComponent } from '../../../core/components/modular/modular-header/modular-header.component';
import { LanguageSelectorComponent } from "../../../core/components/language-selector/language-selector.component";
import { LocalizationKeys } from '../../../core/services/localization-service/localization.models';

@Component({
  selector: 'app-page-auth-main',
  standalone: true,
  imports: [ModularHeaderComponent, RouterOutlet, LanguageSelectorComponent],
  templateUrl: './page-auth-main.component.html',
  styleUrl: './page-auth-main.component.scss'
})
export class PageAuthMainComponent {
  @Input() protected simulate: boolean = false;
  protected LanguageKeys = LocalizationKeys;
}
