import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface SeoPayload {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  update(payload: SeoPayload): void {
    const fullTitle = payload.title
      ? `${payload.title} | ${environment.siteName}`
      : `${environment.siteName} | ${environment.tagline}`;
    const description =
      payload.description ||
      'Build the future AI workforce from STEM excellence with ROOT2 STEM AI programs, workshops, and career paths.';
    const image = this.abs(payload.image || '/images/logo.png');
    const url = this.abs(payload.url || '/');

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    if (payload.keywords) {
      this.meta.updateTag({ name: 'keywords', content: payload.keywords });
    }

    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: payload.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: environment.siteName });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
    if (payload.jsonLd) this.setJsonLd(payload.jsonLd);
  }

  private abs(path: string): string {
    if (path.startsWith('http')) return path;
    return `${environment.siteUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(data: Record<string, unknown> | Record<string, unknown>[]): void {
    const id = 'root2-jsonld';
    let script = this.doc.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
}
