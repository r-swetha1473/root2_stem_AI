import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

const KEY = 'root2_admin_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  readonly mode = signal<'light' | 'dark'>(this.read());

  toggle(): void {
    this.set(this.mode() === 'light' ? 'dark' : 'light');
  }

  set(mode: 'light' | 'dark'): void {
    this.mode.set(mode);
    localStorage.setItem(KEY, mode);
    this.doc.documentElement.classList.toggle('admin-dark', mode === 'dark');
  }

  applyStored(): void {
    this.set(this.mode());
  }

  private read(): 'light' | 'dark' {
    return (localStorage.getItem(KEY) as 'light' | 'dark') || 'light';
  }
}
