import { Component } from '@angular/core';
import { InputSelectorComponent } from '../../../../core/components/input-components/input-selector/input-selector.component';
import { ModalFullscreenComponent } from '../../../../lib/components/modal/modal-fullscreen/modal-fullscreen.component';

@Component({
  selector: 'app-user-settings-modal',
  standalone: true,
  imports: [ModalFullscreenComponent, InputSelectorComponent],
  templateUrl: './user-settings-modal.component.html',
  styleUrls: ['./user-settings-modal.component.scss'],
})
export class UserSettingsModalComponent {

  constructor() {}
}
