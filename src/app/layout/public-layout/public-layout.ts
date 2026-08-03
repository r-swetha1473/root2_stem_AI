import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <a href="#main-content" class="skip-link">Skip to content</a>
    <app-header />
    <main id="main-content" class="min-h-[60vh]">
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class PublicLayout {}
