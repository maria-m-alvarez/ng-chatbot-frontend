import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Icons } from '../icon-service/icons';
import { FileType } from './file-types';

@Injectable({
  providedIn: 'root',
})
export class FileService {
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

  constructor(private readonly sanitizer: DomSanitizer) {}

  getFileIcon(file: File): SafeHtml {
    const fileType = this.getFileType(file);
    const icon = this.getIconForFileType(fileType);
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  getFileType(file: File): FileType {
    const mime = file.type; // MIME type detection
    console.log('Detected MIME type:', mime); // Debugging log

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

    console.warn('Unrecognized MIME type:', mime); // Log unrecognized MIME types
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
}
