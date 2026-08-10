import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PUBLIC_NAV } from '../../core/constants/sheets';
import { FooterContent, SiteSettings, SocialLink } from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { NewsletterComponent } from '../../shared/components/newsletter/newsletter';
import { parseLinks } from '../../shared/utils/cms.helpers';

const DEFAULT_QUICK_LINKS = PUBLIC_NAV.filter((n) => n.path !== '/').map((n) => ({
  label: n.label,
  path: n.path,
}));

const DEFAULT_PROGRAM_LINKS = [
  { label: 'Prompt Engineering', path: '/programs' },
  { label: 'AI Trainer', path: '/career-paths/ai-trainer' },
  { label: 'Medical AI', path: '/career-paths/medical-ai' },
  { label: 'All Programs', path: '/programs' },
];

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, NewsletterComponent],
  templateUrl: './footer.html',
  styles: [
    `
      :host {
        display: block;
      }

      .footer-link {
        color: rgba(255, 255, 255, 0.82) !important;
      }

      .footer-link:hover {
        color: #00aeef !important;
      }

      .footer-heading {
        color: #ffffff !important;
      }

      .footer-muted {
        color: rgba(255, 255, 255, 0.72) !important;
      }
    `,
  ],
})
export class FooterComponent implements OnInit {
  private readonly api = inject(SheetsApiService);

  readonly footer = signal<FooterContent | null>(null);
  readonly settings = signal<SiteSettings | null>(null);
  readonly socials = signal<SocialLink[]>([]);

  readonly quickLinks = computed(() => {
    const parsed = parseLinks(String(this.footer()?.quick_links ?? ''));
    return parsed.length ? parsed : DEFAULT_QUICK_LINKS;
  });

  readonly programLinks = computed(() => {
    const parsed = parseLinks(String(this.footer()?.programs_links ?? ''));
    return parsed.length ? parsed : DEFAULT_PROGRAM_LINKS;
  });

  readonly tagline = computed(
    () =>
      this.footer()?.subtitle ||
      this.settings()?.tagline ||
      'Building the Future AI Workforce from STEM Excellence',
  );

  readonly blurb = computed(
    () => this.footer()?.description || this.settings()?.about_short || 'AI Talent | Training | Workforce Solutions',
  );

  readonly newsletterText = computed(
    () => this.footer()?.newsletter_text || 'Get STEM–AI career insights and workshop invites.',
  );

  readonly copyright = computed(
    () => this.settings()?.copyright || '© 2026 ROOT2 STEM AI. All rights reserved.',
  );

  ngOnInit(): void {
    this.api.list<FooterContent>({ sheet: 'Footer', status: 'active' }).subscribe((res) => {
      this.footer.set(res.data?.[0] ?? null);
    });
    this.api.list<SiteSettings>({ sheet: 'Settings' }).subscribe((res) => {
      this.settings.set(res.data?.[0] ?? null);
    });
    this.api.list<SocialLink>({ sheet: 'SocialLinks', status: 'active' }).subscribe((res) => {
      this.socials.set(res.data ?? []);
    });
  }
}
