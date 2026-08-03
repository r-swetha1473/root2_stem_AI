import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterContent, SiteSettings, SocialLink } from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { NewsletterComponent } from '../../shared/components/newsletter/newsletter';
import { parseLinks } from '../../shared/utils/cms.helpers';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, NewsletterComponent],
  templateUrl: './footer.html',
})
export class FooterComponent implements OnInit {
  private readonly api = inject(SheetsApiService);

  readonly footer = signal<FooterContent | null>(null);
  readonly settings = signal<SiteSettings | null>(null);
  readonly socials = signal<SocialLink[]>([]);

  quickLinks: { label: string; path: string }[] = [];
  programLinks: { label: string; path: string }[] = [];

  ngOnInit(): void {
    this.api.list<FooterContent>({ sheet: 'Footer', status: 'active' }).subscribe((res) => {
      const row = res.data?.[0] ?? null;
      this.footer.set(row);
      if (row) {
        this.quickLinks = parseLinks(row.quick_links);
        this.programLinks = parseLinks(row.programs_links);
      }
    });
    this.api.list<SiteSettings>({ sheet: 'Settings' }).subscribe((res) => {
      this.settings.set(res.data?.[0] ?? null);
    });
    this.api.list<SocialLink>({ sheet: 'SocialLinks', status: 'active' }).subscribe((res) => {
      this.socials.set(res.data ?? []);
    });
  }
}
