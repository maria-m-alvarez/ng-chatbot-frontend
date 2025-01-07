import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ModalFullscreenComponent } from "../../../lib/components/modal/modal-fullscreen/modal-fullscreen.component";

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  imports: [NgxExtendedPdfViewerModule, ModalFullscreenComponent],
})
export class PdfViewerComponent implements OnChanges {
  @Input() pdfUrl: string = '';
  @Input() page: number = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['page'] && this.page > 0) {
      this.scrollToPage(this.page);
    }
  }

  private scrollToPage(page: number): void {
    const pdfViewerElement = document.querySelector('ngx-extended-pdf-viewer');
    if (pdfViewerElement) {
      const event = new CustomEvent('scroll-to-page', { detail: page });
      pdfViewerElement.dispatchEvent(event);
    }
  }
}
