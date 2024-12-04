import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Theme } from '../../models/theme';
import { ConfigService } from '../../config/config.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly darkModeSubject = new BehaviorSubject<boolean>(false);

  constructor(readonly configService: ConfigService) {
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    this.darkModeSubject.next(savedTheme);
    this.applyTheme(savedTheme ? 'dark' : 'light');
  }

  toggleTheme(): void {
    const isDark = !this.darkModeSubject.value;
    this.darkModeSubject.next(isDark);
    localStorage.setItem('darkMode', isDark.toString());
    this.applyTheme(isDark ? 'dark' : 'light');
    this.updateTheme(isDark);
    console.log('Theme toggled:', isDark ? 'dark' : 'light');
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  private applyTheme(mode: 'light' | 'dark'): void {
    const theme = this.configService.getTheme(mode);
    this.setCSSVariables(theme);
  }

  private updateTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private setCSSVariables(theme: Theme): void {
    const root = document.documentElement;

    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value as string);
    });
  }
}
