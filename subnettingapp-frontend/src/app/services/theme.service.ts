import { Injectable } from '@angular/core';

type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly linkEl = document.getElementById(
    'theme-link'
  ) as HTMLLinkElement;

  private readonly storageKey = 'app-theme';

  constructor() {
    this.initTheme();
  }

  initTheme() {
    const saved = (localStorage.getItem(this.storageKey) as Theme) || 'auto';
    this.setTheme(saved);
  }

  /** Témapreferencia beállítása */
  setTheme(theme: Theme) {
    localStorage.setItem(this.storageKey, theme);
    switch (theme) {
      case 'light':
        this.linkEl.href = '/stylesheets/light.css';
        break;
      case 'dark':
        this.linkEl.href = '/stylesheets/dark.css';
        break;
      case 'auto':
        this.linkEl.href = '/stylesheets/auto.css';
        break;
    }
  }
}
