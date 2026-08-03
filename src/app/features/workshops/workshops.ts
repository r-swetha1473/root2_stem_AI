import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Workshop } from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapRevealDirective } from '../../shared/directives/gsap-reveal.directive';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { formatDate } from '../../shared/utils/cms.helpers';

@Component({
  selector: 'app-workshops',
  standalone: true,
  imports: [RouterLink, GsapRevealDirective, SectionHeadingComponent],
  templateUrl: './workshops.html',
})
export class Workshops implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);

  readonly all = signal<Workshop[]>([]);
  readonly tab = signal<'upcoming' | 'past'>('upcoming');

  readonly filtered = computed(() =>
    this.all().filter((w) => (this.tab() === 'upcoming' ? w.type === 'upcoming' : w.type === 'past')),
  );

  ngOnInit(): void {
    this.seo.update({
      title: 'Workshops',
      description: 'Live STEM–AI workshops—online and hybrid cohorts.',
      url: '/workshops',
    });
    this.api.list<Workshop>({ sheet: 'Workshops', status: 'active' }).subscribe((r) => {
      this.all.set(r.data ?? []);
    });
  }

  setTab(value: 'upcoming' | 'past'): void {
    this.tab.set(value);
  }

  formatDate = formatDate;
}
