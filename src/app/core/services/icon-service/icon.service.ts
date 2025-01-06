import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Icons } from './icons';

@Injectable({
  providedIn: 'root'
})
export class IconService {

  icons = Icons;

  constructor(private readonly sanitizer: DomSanitizer) { }

  getSanitizedIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }
}
