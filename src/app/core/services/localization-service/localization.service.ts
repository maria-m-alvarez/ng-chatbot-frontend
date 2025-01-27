import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Translations, Language, LocalizationKeys } from './localization.models';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {
  private translations: Translations | null = null;
  private readonly languageSubject = new BehaviorSubject<string>('pt'); // Default to Portuguese
  public language$ = this.languageSubject.asObservable();

  public readonly onLanguagesLoaded = new EventEmitter<void>();

  constructor(private readonly http: HttpClient) {
    this.loadTranslations();
  }

  // ✅ Improved JSON Parsing & Initialization
  private loadTranslations(): void {
    this.http.get<Translations>('/localization.json').subscribe({
      next: (data) => {
        if (!data?.languages || !data?.entries) {
          console.error('Localization JSON is malformed:', data);
          return;
        }

        this.translations = {
          languages: data.languages.map(lang => ({ code: lang.code, name: lang.name })),
          entries: data.entries
        };

        const savedLang = localStorage.getItem('language') ?? 'pt';
        this.languageSubject.next(savedLang); // ✅ Ensuring BehaviorSubject always emits
        localStorage.setItem('language', savedLang);

        this.onLanguagesLoaded.emit();
        console.log('✅ Localization Data Loaded:', this.translations);
      },
      error: (err) => {
        console.error('❌ Failed to load localization data:', err);
      }
    });
  }

  // ✅ Force `BehaviorSubject` to Emit Even If Value is the Same
  setLanguage(lang: string): void {
    if (!this.translations) {
      console.warn('⚠️ Attempted to set language before translations were loaded.');
      return;
    }

    if (!this.translations.languages.some(l => l.code === lang)) {
      console.warn(`⚠️ Attempted to set an invalid language: ${lang}`);
      return;
    }

    this.languageSubject.next(''); // **Forces reactivity by setting an empty value first**
    this.languageSubject.next(lang); // **Then sets the actual language**
    localStorage.setItem('language', lang);
    console.log(`🌐 Language set to: ${lang}`);
  }

  getAvailableLanguages(): Language[] {
    return this.translations?.languages || [];
  }

  translate(localizationKey: LocalizationKeys): string {
    if (!this.translations) {
      console.warn('⚠️ Attempted to translate before translations were loaded.');
      return localizationKey;
    }

    const lang = this.languageSubject.getValue();
    return this.translations.entries[localizationKey]?.[lang] || localizationKey;
  }
}
