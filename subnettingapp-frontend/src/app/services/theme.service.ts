import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly linkEl = document.getElementById(
    'theme-link'
  ) as HTMLLinkElement;

  private readonly storageKey = 'app-theme';

  constructor() {}

  refresh() {
    this.setTheme(this.getCurrentTheme());
  }

  getCurrentTheme(): Theme {
    return (localStorage.getItem(this.storageKey) as Theme) || 'auto';
  }
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
