import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'; // Adjust path as necessary

@Injectable({
  providedIn: 'root',
})
export class HostService {
  constructor() {}

  getHostBaseURL(): string {
    if (environment.production) {
      const host = window.location.host;
      const protocol = window.location.protocol;
      return `${protocol}//${host}`;
    } else {
      return 'http://localhost:8000';
    }
  }
}
