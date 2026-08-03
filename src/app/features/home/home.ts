import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AboutSection,
  BlogPost,
  CareerPath,
  FaqItem,
  GalleryItem,
  HeroContent,
  Partner,
  Program,
  Statistic,
  Testimonial,
  Workshop,
} from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapRevealDirective } from '../../shared/directives/gsap-reveal.directive';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { TechHeroBgComponent } from '../../shared/components/tech-hero-bg/tech-hero-bg';
import { WHY_CHOOSE_ROOT2 } from './why-choose.data';
import { formatDate } from '../../shared/utils/cms.helpers';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, GsapRevealDirective, SectionHeadingComponent, TechHeroBgComponent],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);

  readonly hero = signal<HeroContent | null>(null);
  readonly partners = signal<Partner[]>([]);
  readonly stats = signal<Statistic[]>([]);
  readonly about = signal<AboutSection | null>(null);
  readonly programs = signal<Program[]>([]);
  readonly careers = signal<CareerPath[]>([]);
  readonly workshops = signal<Workshop[]>([]);
  readonly whyChoose = WHY_CHOOSE_ROOT2;
  readonly testimonials = signal<Testimonial[]>([]);
  readonly gallery = signal<GalleryItem[]>([]);
  readonly blogs = signal<BlogPost[]>([]);
  readonly faqs = signal<FaqItem[]>([]);

  ngOnInit(): void {
    this.seo.update({
      title: 'Home',
      description:
        'Build the future AI workforce from STEM excellence. Programs, workshops, and career paths at ROOT2 STEM AI.',
      url: '/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ROOT2 STEM AI',
        url: 'https://root2stemai.com',
        logo: 'https://root2stemai.com/images/logo.png',
        description: 'Building the Future AI Workforce from STEM Excellence',
      },
    });

    this.api.list<HeroContent>({ sheet: 'Hero', status: 'active' }).subscribe((r) => {
      this.hero.set(r.data?.[0] ?? null);
    });
    this.api.list<Partner>({ sheet: 'Partners', status: 'active' }).subscribe((r) => {
      this.partners.set(r.data ?? []);
    });
    this.api.list<Statistic>({ sheet: 'Statistics', status: 'active' }).subscribe((r) => {
      this.stats.set(r.data ?? []);
    });
    this.api.list<AboutSection>({ sheet: 'About', status: 'active' }).subscribe((r) => {
      this.about.set(r.data?.find((a) => a.section === 'mission') ?? r.data?.[0] ?? null);
    });
    this.api.list<Program>({ sheet: 'Programs', status: 'active', pageSize: 4 }).subscribe((r) => {
      this.programs.set(r.data ?? []);
    });
    this.api.list<CareerPath>({ sheet: 'CareerPaths', status: 'active', pageSize: 6 }).subscribe((r) => {
      this.careers.set(r.data ?? []);
    });
    this.api.list<Workshop>({ sheet: 'Workshops', status: 'active' }).subscribe((r) => {
      this.workshops.set((r.data ?? []).filter((w) => w.type === 'upcoming').slice(0, 3));
    });
    this.api.list<Testimonial>({ sheet: 'Testimonials', status: 'active' }).subscribe((r) => {
      this.testimonials.set(r.data ?? []);
    });
    this.api.list<GalleryItem>({ sheet: 'Gallery', status: 'active', pageSize: 4 }).subscribe((r) => {
      this.gallery.set(r.data ?? []);
    });
    this.api.list<BlogPost>({ sheet: 'Blogs', status: 'active', pageSize: 3 }).subscribe((r) => {
      this.blogs.set(r.data ?? []);
    });
    this.api.list<FaqItem>({ sheet: 'FAQs', status: 'active', pageSize: 5 }).subscribe((r) => {
      this.faqs.set(r.data ?? []);
    });
  }

  statDisplay(stat: Statistic): string {
    return `${stat.value ?? ''}${stat.suffix ?? ''}`;
  }

  partnerLogo(partner: Partner): string {
    const logo = String(partner.logo || '').trim();
    if (logo) return logo;
    const fallbacks = [
      '/illustrations/partner-1.svg',
      '/illustrations/partner-2.svg',
      '/illustrations/partner-3.svg',
    ];
    const order = Number(partner.display_order) || 1;
    return fallbacks[(order - 1) % fallbacks.length];
  }

  formatDate = formatDate;
}
