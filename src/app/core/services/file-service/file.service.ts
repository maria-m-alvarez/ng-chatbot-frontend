import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Icons } from '../icon-service/icons';
import { FileType } from './file-types';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { of } from 'rxjs';
import { AuthService } from '../../../features/authentication/auth-service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private readonly apiBaseUrl = 'http://127.0.0.1:8000/files';
  private readonly downloadedFiles: Set<string> = new Set();

  private readonly codeFileTypes = [
    'application/javascript', 'application/x-javascript', 'text/javascript', // JavaScript
    'application/json', 'text/json',                                         // JSON
    'application/x-python-code', 'text/x-python', 'text/x-script.python',    // Python
    'text/x-java-source', 'text/x-java',                                     // Java
    'text/x-csrc', 'text/x-chdr',                                            // C/C++
    'application/x-httpd-php', 'text/x-php',                                 // PHP
    'application/x-sh', 'text/x-shellscript',                                // Shell scripts
    'text/x-csharp',                                                         // C#
    'text/html',                                                             // HTML
    'text/css',                                                              // CSS
    'text/x-ruby',                                                           // Ruby
    'text/x-go',                                                             // Go
    'text/x-perl',                                                           // Perl
    'text/x-sql',                                                            // SQL
    'text/x-markdown',                                                       // Markdown
    'text/x-yaml', 'application/x-yaml',                                     // YAML
    'application/xml', 'text/xml',                                           // XML
    'application/vnd.dart',                                                  // Dart
    'text/x-typescript',                                                     // TypeScript
    'text/x-kotlin',                                                         // Kotlin
    'text/x-swift',                                                          // Swift
  ];

  private readonly compressedFileTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-7z-compressed',
    'application/x-rar-compressed',
    'application/gzip',
    'application/x-tar',
    'application/x-bzip',
    'application/x-bzip2',
  ];

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getFileIcon(file: File): SafeHtml {
    const fileType = this.getFileType(file);
    const icon = this.getIconForFileType(fileType);
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  getFileType(file: File): FileType {
    const mime = file.type; // mime = Multipurpose Internet Mail Extensions

    if (mime.startsWith('image/')) return FileType.Image;
    if (mime.startsWith('audio/')) return FileType.Audio;
    if (mime.startsWith('video/')) return FileType.Video;
    if (mime === 'application/pdf') return FileType.Pdf;
    if (this.isDocumentType(mime)) return FileType.Document;
    if (this.isPresentationType(mime)) return FileType.Presentation;
    if (this.isSpreadsheetType(mime)) return FileType.Spreadsheet;
    if (this.isCodeType(mime)) return FileType.Code;
    if (mime.startsWith('text/')) return FileType.Text;
    if (this.isCompressedType(mime)) return FileType.Compressed;

    console.warn('Unrecognized MIME type:', mime);
    return FileType.Default;
  }

  private getIconForFileType(fileType: FileType): string {
    switch (fileType) {
      case FileType.Image:
        return Icons.image;
      case FileType.Audio:
        return Icons.audio;
      case FileType.Video:
        return Icons.video;
      case FileType.Pdf:
        return Icons.pdf;
      case FileType.Document:
        return Icons.document;
      case FileType.Presentation:
        return Icons.presentation;
      case FileType.Spreadsheet:
        return Icons.spreadsheet;
      case FileType.Code:
        return Icons.code;
      case FileType.Text:
        return Icons.text;
      case FileType.Compressed:
        return Icons.compressed;
      default:
        return Icons.file;
    }
  }

  private isDocumentType(mime: string): boolean {
    return [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
      'application/rtf',
    ].includes(mime);
  }

  private isPresentationType(mime: string): boolean {
    return [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.presentation',
    ].includes(mime);
  }

  private isSpreadsheetType(mime: string): boolean {
    return [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',
    ].includes(mime);
  }

  private isCodeType(mime: string): boolean {
    return this.codeFileTypes.includes(mime);
  }

  private isCompressedType(mime: string): boolean {
    return this.compressedFileTypes.includes(mime);
  }


  // ------------------------------
  // File Download with Cache
  // ------------------------------

  referenceFileDownload(fileName: string): Observable<string> {
    if (this.downloadedFiles.has(fileName)) {
      // File already exists
      console.log(`File "${fileName}" already downloaded.`);
      return of(`File "${fileName}" already exists locally.`);
    }

    // File does not exist, proceed to download
    return this.downloadFile(fileName).pipe(
      map((fileBlob) => {
        this.saveFile(fileBlob, fileName); // Save file locally
        this.downloadedFiles.add(fileName); // Add to in-memory cache
        return `File "${fileName}" downloaded successfully.`;
      }),
      catchError((error) => {
        console.error(`Error downloading file "${fileName}":`, error);
        throw new Error(`Failed to download file "${fileName}".`);
      })
    );
  }

  private saveFile(fileBlob: Blob, fileName: string): void {
    saveAs(fileBlob, fileName); // Use FileSaver to trigger download
  }
  
  // ------------------------------
  // Backend Interaction Methods
  // ------------------------------

  listFiles(): Observable<{ name: string }[]> {
    return this.http.get<{ name: string }[]>(`${this.apiBaseUrl}/`, { headers: this.authService.headers });
  }

  downloadFile(docId: string): Observable<Blob> {
    const url = `${this.apiBaseUrl}/${encodeURIComponent(docId)}`;
    return this.http.get(url, { headers: this.authService.headers, responseType: 'blob' });
  }

  getFileMetadata(docId: string): Observable<{
    name: string;
    size: number;
    created_at: number;
    updated_at: number;
  }> {
    const url = `${this.apiBaseUrl}/${encodeURIComponent(docId)}/metadata`;
    return this.http.get<{
      name: string;
      size: number;
      created_at: number;
      updated_at: number;
    }>(url);
  }
}
