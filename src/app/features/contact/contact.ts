import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SiteSettings, SocialLink } from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapRevealDirective } from '../../shared/directives/gsap-reveal.directive';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, GsapRevealDirective, SectionHeadingComponent],
  templateUrl: './contact.html',
})
export class Contact implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  readonly settings = signal<SiteSettings | null>(null);
  readonly mapUrl = computed<SafeResourceUrl | null>(() => {
    const embed = this.settings()?.map_embed;
    return embed ? this.sanitizer.bypassSecurityTrustResourceUrl(embed) : null;
  });
  readonly socials = signal<SocialLink[]>([]);
  readonly submitting = signal(false);
  readonly message = signal('');
  readonly success = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.seo.update({
      title: 'Contact',
      description: 'Get in touch with ROOT2 STEM AI for programs, workshops, and partnerships.',
      url: '/contact',
    });
    this.api.list<SiteSettings>({ sheet: 'Settings' }).subscribe((r) => {
      this.settings.set(r.data?.[0] ?? null);
    });
    this.api.list<SocialLink>({ sheet: 'SocialLinks', status: 'active' }).subscribe((r) => {
      this.socials.set(r.data ?? []);
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.message.set('');
    this.api.submitContact(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.success.set(res.success);
        this.message.set(res.success ? 'Message sent! We will get back to you soon.' : (res.error ?? 'Failed to send.'));
        if (res.success) this.form.reset();
      },
      error: () => {
        this.submitting.set(false);
        this.success.set(false);
        this.message.set('Unable to send message. Please try again.');
      },
    });
  }
}
