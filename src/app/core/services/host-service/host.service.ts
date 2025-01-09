import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

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

  allowUserRegistration(): boolean {
    return environment.allowUserRegistration;
  }

  allowSimulatedLogin(): boolean {
    return environment.allowSimulatedLogin;
  }

  allowSidebar(): boolean {
    return environment.allowSidebar;
  }
}
