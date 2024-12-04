import { Component } from '@angular/core';
import { InputSelectorComponent } from '../../../../core/components/input-components/input-selector/input-selector.component';
import { ModularModalComponent } from '../../../../core/components/modular/modular-modal/modular-modal.component';

@Component({
  selector: 'app-user-settings-modal',
  standalone: true,
  imports: [ModularModalComponent, InputSelectorComponent],
  templateUrl: './user-settings-modal.component.html',
  styleUrl: './user-settings-modal.component.scss'
})
export class UserSettingsModalComponent {

}
