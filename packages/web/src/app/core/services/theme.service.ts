import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'pastel';

const THEME_KEY = 'nyct-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // Apply theme on changes and persist to localStorage
    effect(() => {
      const currentTheme = this.theme();
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem(THEME_KEY, currentTheme);
    });

    // Apply initial theme immediately
    document.documentElement.setAttribute('data-theme', this.theme());
  }

  toggle(): void {
    this.theme.update((t) => (t === 'dark' ? 'pastel' : 'dark'));
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  private getStoredTheme(): Theme {
    if (typeof localStorage === 'undefined') {
      return 'dark';
    }
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'pastel' || stored === 'dark') {
      return stored;
    }
    return 'dark';
  }
}
