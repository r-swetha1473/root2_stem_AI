import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { forkJoin } from 'rxjs';
import {
  FooterContent,
  SeoSettings,
  SiteSettings,
  SocialLink,
} from '../../../core/models/cms.models';
import { SheetsApiService } from '../../../core/services/sheets-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';

type SectionKey = 'website' | 'contact' | 'social' | 'seo' | 'footer';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ImageUploadComponent,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
})
export class SettingsPageComponent implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal<SectionKey | null>(null);
  readonly openSections = signal<Record<SectionKey, boolean>>({
    website: true,
    contact: true,
    social: true,
    seo: true,
    footer: true,
  });

  private settingsId = '';
  private seoId = '';
  private footerId = '';
  private socialIds: Record<string, string> = {};

  readonly websiteForm = this.fb.group({
    site_name: [''],
    tagline: [''],
    logo: [''],
    favicon: [''],
    about_short: [''],
  });

  readonly contactForm = this.fb.group({
    email: [''],
    phone: [''],
    address: [''],
    map_embed: [''],
  });

  readonly socialForm = this.fb.group({
    facebook: [''],
    linkedin: [''],
    instagram: [''],
    youtube: [''],
    twitter: [''],
  });

  readonly seoForm = this.fb.group({
    default_title: [''],
    default_description: [''],
    keywords: [''],
    og_image: [''],
    twitter_handle: [''],
    canonical_base: [''],
  });

  readonly footerForm = this.fb.group({
    copyright: [''],
    quick_links: [''],
    programs_links: [''],
    newsletter_text: [''],
    description: [''],
  });

  ngOnInit(): void {
    forkJoin({
      settings: this.api.list<SiteSettings>({ sheet: 'Settings', pageSize: 1 }),
      seo: this.api.list<SeoSettings>({ sheet: 'SEO', pageSize: 1 }),
      social: this.api.list<SocialLink>({ sheet: 'SocialLinks', pageSize: 50 }),
      footer: this.api.list<FooterContent>({ sheet: 'Footer', pageSize: 1 }),
    }).subscribe({
      next: ({ settings, seo, social, footer }) => {
        const s = settings.data?.[0];
        if (s) {
          this.settingsId = s.id;
          this.websiteForm.patchValue({
            site_name: String(s.site_name ?? ''),
            tagline: String(s.tagline ?? ''),
            logo: String(s.logo ?? ''),
            favicon: String(s.favicon ?? ''),
            about_short: String(s.about_short ?? ''),
          });
          this.contactForm.patchValue({
            email: String(s.email ?? ''),
            phone: String(s.phone ?? ''),
            address: String(s.address ?? ''),
            map_embed: String(s.map_embed ?? ''),
          });
          this.footerForm.patchValue({ copyright: String(s.copyright ?? '') });
        }

        const seoRow = seo.data?.[0];
        if (seoRow) {
          this.seoId = seoRow.id;
          this.seoForm.patchValue({
            default_title: String(seoRow.default_title ?? ''),
            default_description: String(seoRow.default_description ?? ''),
            keywords: String(seoRow.keywords ?? ''),
            og_image: String(seoRow.og_image ?? ''),
            twitter_handle: String(seoRow.twitter_handle ?? ''),
            canonical_base: String(seoRow.canonical_base ?? ''),
          });
        }

        for (const link of social.data ?? []) {
          const platform = String(link.platform ?? link.title ?? '').toLowerCase();
          if (!platform) continue;
          this.socialIds[platform] = link.id;
          if (platform in this.socialForm.controls) {
            this.socialForm.get(platform)?.setValue(String(link.url ?? ''));
          }
        }

        const f = footer.data?.[0];
        if (f) {
          this.footerId = f.id;
          this.footerForm.patchValue({
            copyright: this.footerForm.value.copyright || String(f.subtitle ?? ''),
            quick_links: String(f.quick_links ?? ''),
            programs_links: String(f.programs_links ?? ''),
            newsletter_text: String(f.newsletter_text ?? ''),
            description: String(f.description ?? ''),
          });
        }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load website settings');
      },
    });
  }

  toggle(section: SectionKey): void {
    this.openSections.update((s) => ({ ...s, [section]: !s[section] }));
  }

  isOpen(section: SectionKey): boolean {
    return this.openSections()[section];
  }

  saveWebsite(): void {
    if (!this.settingsId) return;
    this.saving.set('website');
    this.api
      .update('Settings', this.settingsId, {
        ...this.websiteForm.getRawValue(),
        title: this.websiteForm.value.site_name || 'Settings',
      })
      .subscribe({
        next: (res) => {
          this.saving.set(null);
          res.success ? this.toast.success('Website information saved') : this.toast.error('Save failed');
        },
        error: () => {
          this.saving.set(null);
          this.toast.error('Save failed');
        },
      });
  }

  saveContact(): void {
    if (!this.settingsId) return;
    this.saving.set('contact');
    this.api.update('Settings', this.settingsId, this.contactForm.getRawValue()).subscribe({
      next: (res) => {
        this.saving.set(null);
        res.success ? this.toast.success('Contact information saved') : this.toast.error('Save failed');
      },
      error: () => {
        this.saving.set(null);
        this.toast.error('Save failed');
      },
    });
  }

  saveSocial(): void {
    this.saving.set('social');
    const values = this.socialForm.getRawValue();
    const platforms = Object.keys(values) as Array<keyof typeof values>;
    const ops = platforms.map((platform) => {
      const url = String(values[platform] ?? '');
      const id = this.socialIds[platform];
      if (id) {
        return this.api.update('SocialLinks', id, {
          title: platform,
          platform,
          url,
          status: 'active',
        });
      }
      return this.api.create('SocialLinks', {
        title: platform,
        platform,
        url,
        status: 'active',
        display_order: 1,
      });
    });

    forkJoin(ops).subscribe({
      next: (results) => {
        results.forEach((res, i) => {
          const platform = platforms[i];
          if (res.success && res.data && !this.socialIds[platform]) {
            this.socialIds[platform] = (res.data as SocialLink).id;
          }
        });
        this.saving.set(null);
        this.toast.success('Social media saved');
      },
      error: () => {
        this.saving.set(null);
        this.toast.error('Save failed');
      },
    });
  }

  saveSeo(): void {
    if (!this.seoId) return;
    this.saving.set('seo');
    this.api
      .update('SEO', this.seoId, {
        ...this.seoForm.getRawValue(),
        title: this.seoForm.value.default_title || 'SEO',
      })
      .subscribe({
        next: (res) => {
          this.saving.set(null);
          res.success ? this.toast.success('SEO settings saved') : this.toast.error('Save failed');
        },
        error: () => {
          this.saving.set(null);
          this.toast.error('Save failed');
        },
      });
  }

  saveFooter(): void {
    this.saving.set('footer');
    const payload = {
      ...this.footerForm.getRawValue(),
      title: 'Footer',
      subtitle: this.footerForm.value.copyright || '',
      status: 'active' as const,
    };

    const req = this.footerId
      ? this.api.update('Footer', this.footerId, payload)
      : this.api.create('Footer', payload);

    // Also persist copyright on Settings when available
    if (this.settingsId) {
      this.api.update('Settings', this.settingsId, {
        copyright: this.footerForm.value.copyright || '',
      }).subscribe();
    }

    req.subscribe({
      next: (res) => {
        if (res.success && res.data && !this.footerId) {
          this.footerId = (res.data as unknown as FooterContent).id;
        }
        this.saving.set(null);
        res.success ? this.toast.success('Footer saved') : this.toast.error('Save failed');
      },
      error: () => {
        this.saving.set(null);
        this.toast.error('Save failed');
      },
    });
  }
}
