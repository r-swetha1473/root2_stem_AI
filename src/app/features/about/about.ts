import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AboutSection, Partner, TeamMember } from '../../core/models/cms.models';
import { SheetsApiService } from '../../core/services/sheets-api.service';
import { SeoService } from '../../core/services/seo.service';
import { GsapRevealDirective } from '../../shared/directives/gsap-reveal.directive';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, GsapRevealDirective, SectionHeadingComponent],
  templateUrl: './about.html',
})
export class About implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);

  readonly sections = signal<AboutSection[]>([]);
  readonly team = signal<TeamMember[]>([]);
  readonly partners = signal<Partner[]>([]);

  ngOnInit(): void {
    this.seo.update({
      title: 'About Us',
      description: 'Mission, vision, team, and partners behind ROOT2 STEM AI.',
      url: '/about',
    });
    this.api.list<AboutSection>({ sheet: 'About', status: 'active' }).subscribe((r) => {
      this.sections.set(r.data ?? []);
    });
    this.api.list<TeamMember>({ sheet: 'Team', status: 'active' }).subscribe((r) => {
      this.team.set(r.data ?? []);
    });
    this.api.list<Partner>({ sheet: 'Partners', status: 'active' }).subscribe((r) => {
      this.partners.set(r.data ?? []);
    });
  }

  section(key: string): AboutSection | undefined {
    return this.sections().find((s) => s.section === key);
  }
}
