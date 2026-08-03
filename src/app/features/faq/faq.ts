import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { FaqItem } from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapRevealDirective } from '../../shared/directives/gsap-reveal.directive';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [FormsModule, MatExpansionModule, GsapRevealDirective, SectionHeadingComponent],
  templateUrl: './faq.html',
})
export class Faq implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);

  readonly faqs = signal<FaqItem[]>([]);
  readonly search = signal('');

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.faqs();
    return this.faqs().filter(
      (f) =>
        f.title?.toLowerCase().includes(q) ||
        f.answer?.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void {
    this.seo.update({
      title: 'FAQ',
      description: 'Frequently asked questions about ROOT2 STEM AI programs, workshops, and careers.',
      url: '/faq',
    });
    this.api.list<FaqItem>({ sheet: 'FAQs', status: 'active' }).subscribe((r) => {
      this.faqs.set(r.data ?? []);
    });
  }
}
