import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CareerPath } from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapRevealDirective } from '../../shared/directives/gsap-reveal.directive';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'app-career-paths',
  standalone: true,
  imports: [RouterLink, GsapRevealDirective, SectionHeadingComponent],
  templateUrl: './career-paths.html',
})
export class CareerPaths implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);

  readonly paths = signal<CareerPath[]>([]);

  ngOnInit(): void {
    this.seo.update({
      title: 'Career Paths',
      description: 'Nine AI career pathways for STEM professionals—from Prompt Engineer to Medical AI.',
      url: '/career-paths',
    });
    this.api.list<CareerPath>({ sheet: 'CareerPaths', status: 'active' }).subscribe((r) => {
      this.paths.set(r.data ?? []);
    });
  }
}
