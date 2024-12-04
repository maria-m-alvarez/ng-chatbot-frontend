import { Component, Input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ModularHeaderComponent } from '../../../core/components/modular/modular-header/modular-header.component';

@Component({
  selector: 'app-page-auth-main',
  standalone: true,
  imports: [ModularHeaderComponent, RouterOutlet, RouterLink],
  templateUrl: './page-auth-main.component.html',
  styleUrl: './page-auth-main.component.scss'
})
export class PageAuthMainComponent {
  @Input() protected simulate: boolean = false;
}
