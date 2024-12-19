import { Component, Input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ChatbotBrainService } from '../../../../features/chatbot/chatbot-services/chatbot-brain/chatbot-brain.service';
import { Constants } from '../../../constants';
import { LogoMinsaitMagiaComponent } from "../../logo-minsait-magia/logo-minsait-magia.component";

@Component({
  selector: 'app-modular-header',
  templateUrl: './modular-header.component.html',
  styleUrls: ['./modular-header.component.scss'],
  standalone: true,
  imports: [NgTemplateOutlet, LogoMinsaitMagiaComponent],
})
export class ModularHeaderComponent {
  @Input() showLogo: boolean = true;
  @Input() useNegativeLogo: boolean = false;
  @Input() leftContent!: TemplateRef<any>;
  @Input() navContent!: TemplateRef<any>;
  @Input() rightContent!: TemplateRef<any>;

  routes = Constants.ROUTES;

  constructor(public readonly brain: ChatbotBrainService) {}

  getLogo(): string {
    return this.useNegativeLogo
      ? this.brain.configService.organizationLogoNegative
      : this.brain.configService.organizationLogoPositive;
  }
}
