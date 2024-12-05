import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Theme } from '../models/theme';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: any;

  constructor(private readonly http: HttpClient) {
    this.loadConfig();
  }

  loadConfig(): Observable<any> {
    return this.http.get('/assets/config/chatbot.config.json').pipe(
      tap((config) => {
        this.config = config;
        console.log('Config loaded:', this.config);
      })
    );
  }

  getConfig(): any {
    return this.config;
  }

  getFromConfigJson<T>(path: string, fallback: T = undefined as any): T {
    if (!this.config) {
      console.error('Configuration not loaded.');
      return fallback;
    }
  
    try {
      const keys = path.split('.');
      let value = this.config;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined || value === null) {
          return fallback;
        }
      }
      return value as T;
    } catch (error) {
      console.error(`Error accessing config path "${path}":`, error);
      return fallback;
    }
  }

  // ----------------------------------------------
  // Organization Settings
  // ----------------------------------------------
  get organizationLogoPositive(): string {
    return this.getFromConfigJson<string>('organization.logoPos', 'assets/images/default-logo-pos.png');
  }

  get organizationLogoNegative(): string {
    return this.getFromConfigJson<string>('organization.logoNeg', 'assets/images/default-logo-neg.png');
  }

  get organizationName(): string {
    return this.getFromConfigJson<string>('organization.name', 'Default Organization');
  }

  get organizationUrl(): string {
    return this.getFromConfigJson<string>('organization.url', 'https://minsait.com');
  }

  get organizationFavicon(): string {
    return this.getFromConfigJson<string>('organization.favicon', 'assets/images/favicon.png');
  }

  getTheme(mode: 'light' | 'dark' = 'light'): Theme {
    const themeConfig = this.getFromConfigJson<Partial<Theme>>(`themes.${mode}`, {});
    if (Object.keys(themeConfig).length === 0) {
      console.warn(`Theme "${mode}" not found. Using default theme.`);
    }
    return new Theme(themeConfig);
  }
}
