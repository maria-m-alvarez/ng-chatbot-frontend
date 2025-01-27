import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'magia',
  standalone: true
})
export class MagiaPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(value: any): SafeHtml {
    if (typeof value !== 'string') return value;

    // Replace "magia" (case-insensitive) with "MagIA" using HTML formatting
    const formattedValue = value.replace(/magia/gi, match => `
      <span class="flex">
        <span>${match.slice(0, 3)}</span>
        <span class="text-minsait-fucsia">${match.slice(3)}</span>
      </span>
    `);

    // Bypass Angular's strict security for HTML
    return this.sanitizer.bypassSecurityTrustHtml(formattedValue);
  }
}
