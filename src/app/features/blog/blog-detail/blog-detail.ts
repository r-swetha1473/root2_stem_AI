import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogPost } from '../../../core/models/cms.models';
import { SheetsApiService } from '../../../core/services/sheets-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { environment } from '../../../../environments/environment';
import { GsapRevealDirective } from '../../../shared/directives/gsap-reveal.directive';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [RouterLink, GsapRevealDirective],
  templateUrl: './blog-detail.html',
})
export class BlogDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly post = signal<BlogPost | null>(null);
  readonly contentHtml = computed<SafeHtml | ''>(() => {
    const html = this.post()?.content;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : '';
  });
  readonly related = signal<BlogPost[]>([]);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.api.list<BlogPost>({ sheet: 'Blogs', status: 'active' }).subscribe((r) => {
      const all = r.data ?? [];
      const found = all.find((p) => p.slug === slug);
      if (found) {
        this.post.set(found);
        this.related.set(all.filter((p) => p.slug !== slug && p.category === found.category).slice(0, 3));
        this.seo.update({
          title: found.meta_title || found.title,
          description: found.meta_description || found.description,
          url: `/blog/${slug}`,
        });
      } else {
        this.notFound.set(true);
      }
    });
  }

  shareUrl(): string {
    const p = this.post();
    if (!p?.slug) return environment.siteUrl;
    return `${environment.siteUrl.replace(/\/$/, '')}/blog/${p.slug}`;
  }

  share(platform: 'twitter' | 'linkedin' | 'copy'): void {
    const url = encodeURIComponent(this.shareUrl());
    const title = encodeURIComponent(this.post()?.title ?? '');
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    } else {
      navigator.clipboard?.writeText(this.shareUrl());
    }
  }
}
