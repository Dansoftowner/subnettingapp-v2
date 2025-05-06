// src/app/settings/settings.component.ts

import { Component, OnInit } from '@angular/core';
import { SettingsService, Option } from '../../services/settings.service';
import { Theme } from 'src/app/services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  themes: Option[] = [];
  languages: Option[] = [];
  maskFormats: Option[] = [];

  selectedTheme!: Theme;
  selectedLanguage!: string;
  autoMaskEnabled!: boolean;
  selectedMaskFormat!: string;

  constructor(private settingsService: SettingsService) {
    this.settingsService
      .getCurrentTheme()
      .subscribe((val) => (this.selectedTheme = val));

    this.settingsService
      .getCurrentLanguage()
      .subscribe((val) => (this.selectedLanguage = val));

    this.settingsService
      .getAutoMaskEnabled()
      .subscribe((val) => (this.autoMaskEnabled = val));

    this.settingsService
      .getCurrentMaskFormat()
      .subscribe((val) => (this.selectedMaskFormat = val));
  }

  ngOnInit(): void {
    this.settingsService.getThemes().subscribe((opts) => (this.themes = opts));

    this.settingsService
      .getLanguages()
      .subscribe((opts) => (this.languages = opts));

    this.settingsService
      .getMaskFormats()
      .subscribe((opts) => (this.maskFormats = opts));
  }

  onThemeChange(event: Event): void {
    const theme = (event.target as HTMLSelectElement).value as Theme;
    this.settingsService
      .setTheme(theme)
      .subscribe(() => (this.selectedTheme = theme));
  }

  onLanguageChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value;
    this.settingsService
      .setLanguage(lang)
      .subscribe(() => (this.selectedLanguage = lang));
  }

  onAutoMaskChange(event: Event): void {
    const enabled = (event.target as HTMLInputElement).checked;
    this.settingsService
      .setAutoMaskEnabled(enabled)
      .subscribe(() => (this.autoMaskEnabled = enabled));
  }

  onMaskFormatChange(event: Event): void {
    const format = (event.target as HTMLSelectElement).value;
    this.settingsService
      .setMaskFormat(format)
      .subscribe(() => (this.selectedMaskFormat = format));
  }
}
