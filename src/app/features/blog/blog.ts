import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BlogPost } from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapRevealDirective } from '../../shared/directives/gsap-reveal.directive';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, FormsModule, GsapRevealDirective, SectionHeadingComponent],
  templateUrl: './blog.html',
})
export class Blog implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);

  readonly posts = signal<BlogPost[]>([]);
  readonly search = signal('');
  readonly category = signal('');
  readonly sort = signal<'recent' | 'popular'>('recent');

  readonly categories = computed(() => {
    const cats = new Set(this.posts().map((p) => p.category).filter(Boolean));
    return [...cats] as string[];
  });

  readonly filtered = computed(() => {
    let rows = [...this.posts()];
    const q = this.search().toLowerCase().trim();
    const cat = this.category();
    if (q) {
      rows = rows.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.toLowerCase().includes(q),
      );
    }
    if (cat) rows = rows.filter((p) => p.category === cat);
    if (this.sort() === 'popular') {
      rows.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    }
    return rows;
  });

  ngOnInit(): void {
    this.seo.update({
      title: 'Blog',
      description: 'STEM–AI career insights, prompting frameworks, and workforce trends.',
      url: '/blog',
    });
    this.api.list<BlogPost>({ sheet: 'Blogs', status: 'active' }).subscribe((r) => {
      this.posts.set(r.data ?? []);
    });
  }
}
