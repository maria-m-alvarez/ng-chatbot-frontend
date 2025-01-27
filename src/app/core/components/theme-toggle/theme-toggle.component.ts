import { Component, Input } from '@angular/core';
import { BaseThemedComponent } from '../base-components/base-themed-component.component';
import { TranslatePipe } from '../../pipes/translate-pipe.pipe';
import { LocalizationKeys } from '../../services/localization-service/localization.models';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})

export class ThemeToggleComponent extends BaseThemedComponent {
  @Input() isIconOnly: boolean = true;
  @Input() textNextToIcon: string = 'Theme';
  LocalizationKeys = LocalizationKeys;

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
