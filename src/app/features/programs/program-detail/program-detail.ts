import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Program } from '../../../core/models/cms.models';
import { SheetsApiService } from '../../../core/services/sheets-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { GsapRevealDirective } from '../../../shared/directives/gsap-reveal.directive';
import { parseList } from '../../../shared/utils/cms.helpers';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [RouterLink, GsapRevealDirective],
  templateUrl: './program-detail.html',
})
export class ProgramDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);

  readonly program = signal<Program | null>(null);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.api.list<Program>({ sheet: 'Programs', status: 'active' }).subscribe((r) => {
      const found = (r.data ?? []).find((p) => p.slug === slug);
      if (found) {
        this.program.set(found);
        this.seo.update({
          title: found.title,
          description: found.description,
          url: `/programs/${slug}`,
        });
      } else {
        this.notFound.set(true);
      }
    });
  }

  benefits(p: Program): string[] {
    return parseList(p.benefits);
  }
}
