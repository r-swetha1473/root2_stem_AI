import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Program } from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapRevealDirective } from '../../shared/directives/gsap-reveal.directive';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [RouterLink, GsapRevealDirective, SectionHeadingComponent],
  templateUrl: './programs.html',
})
export class Programs implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);

  readonly programs = signal<Program[]>([]);

  ngOnInit(): void {
    this.seo.update({
      title: 'Programs',
      description: 'STEM–AI programs in Prompt Engineering, AI Training, Medical AI, and Data Annotation.',
      url: '/programs',
    });
    this.api.list<Program>({ sheet: 'Programs', status: 'active' }).subscribe((r) => {
      this.programs.set(r.data ?? []);
    });
  }
}
