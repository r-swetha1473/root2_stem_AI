import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CareerPath } from '../../../core/models/cms.models';
import { SheetsApiService } from '../../../core/services/sheets-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { GsapRevealDirective } from '../../../shared/directives/gsap-reveal.directive';
import { parseList } from '../../../shared/utils/cms.helpers';

@Component({
  selector: 'app-career-detail',
  standalone: true,
  imports: [RouterLink, GsapRevealDirective],
  templateUrl: './career-detail.html',
})
export class CareerDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);

  readonly career = signal<CareerPath | null>(null);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.api.list<CareerPath>({ sheet: 'CareerPaths', status: 'active' }).subscribe((r) => {
      const found = (r.data ?? []).find((c) => c.slug === slug);
      if (found) {
        this.career.set(found);
        this.seo.update({
          title: found.title,
          description: found.overview || found.description,
          url: `/career-paths/${slug}`,
        });
      } else {
        this.notFound.set(true);
      }
    });
  }

  list(raw?: string): string[] {
    return parseList(raw);
  }
}
