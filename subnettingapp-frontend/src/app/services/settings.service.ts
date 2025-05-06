import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { Theme, ThemeService } from './theme.service';

export interface Option {
  value: string;
  i18nKey: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private themes: Option[] = [
    { value: 'light', i18nKey: 'settings.theme.light' },
    { value: 'dark', i18nKey: 'settings.theme.dark' },
    { value: 'auto', i18nKey: 'settings.theme.auto' },
  ];

  private languages: Option[] = [
    { value: 'hu', i18nKey: 'settings.language.hu' },
    { value: 'en', i18nKey: 'settings.language.en' },
  ];

  private maskFormats: Option[] = [
    { value: 'cdir', i18nKey: 'settings.auto_mask_format.cdir' },
    { value: 'ddn', i18nKey: 'settings.auto_mask_format.ddn' },
  ];

  constructor(
    private translateService: TranslateService,
    private themeService: ThemeService
  ) {}

  getThemes(): Observable<Option[]> {
    return of(this.themes);
  }

  getCurrentTheme(): Observable<Theme> {
    return of(this.themeService.getCurrentTheme());
  }

  setTheme(theme: Theme): Observable<void> {
    this.themeService.setTheme(theme);
    return of(void 0);
  }

  getLanguages(): Observable<Option[]> {
    return of(this.languages);
  }

  getCurrentLanguage(): Observable<string> {
    const stored = localStorage.getItem('language');
    return of(
      stored ?? this.translateService.currentLang ?? this.languages[0].value
    );
  }

  setLanguage(language: string): Observable<void> {
    localStorage.setItem('language', language);
    this.translateService.use(language);
    return of(void 0);
  }

  getAutoMaskEnabled(): Observable<boolean> {
    const stored = localStorage.getItem('autoMaskEnabled');
    return of(stored === 'true');
  }

  setAutoMaskEnabled(enabled: boolean): Observable<void> {
    localStorage.setItem('autoMaskEnabled', String(enabled));
    return of(void 0);
  }

  getMaskFormats(): Observable<Option[]> {
    return of(this.maskFormats);
  }

  getCurrentMaskFormat(): Observable<string> {
    const stored = localStorage.getItem('maskFormat');
    return of(stored ?? this.maskFormats[0].value);
  }

  setMaskFormat(format: string): Observable<void> {
    localStorage.setItem('maskFormat', format);
    return of(void 0);
  }
}
