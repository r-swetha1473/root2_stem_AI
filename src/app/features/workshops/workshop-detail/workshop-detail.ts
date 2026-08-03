import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Workshop } from '../../../core/models/cms.models';
import { SheetsApiService } from '../../../core/services/sheets-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { GsapRevealDirective } from '../../../shared/directives/gsap-reveal.directive';
import { formatDate, parseFaqs, parseList } from '../../../shared/utils/cms.helpers';

@Component({
  selector: 'app-workshop-detail',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, GsapRevealDirective],
  templateUrl: './workshop-detail.html',
})
export class WorkshopDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(SheetsApiService);
  private readonly seo = inject(SeoService);
  private readonly fb = inject(FormBuilder);

  readonly workshop = signal<Workshop | null>(null);
  readonly notFound = signal(false);
  readonly submitting = signal(false);
  readonly submitMsg = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.api.getById<Workshop>('Workshops', id).subscribe((r) => {
      if (r.success && r.data) {
        this.workshop.set(r.data);
        this.seo.update({
          title: r.data.title,
          description: r.data.description,
          url: `/workshops/${id}`,
        });
      } else {
        this.notFound.set(true);
      }
    });
  }

  agenda(w: Workshop): string[] {
    return parseList(w.agenda);
  }

  faqs(w: Workshop): { q: string; a: string }[] {
    return parseFaqs(w.faqs);
  }

  formatDate = formatDate;

  register(): void {
    if (this.form.invalid || !this.workshop()) return;
    this.submitting.set(true);
    this.submitMsg.set('');
    const w = this.workshop()!;
    this.api
      .registerWorkshop({
        ...this.form.getRawValue(),
        workshop_id: w.id,
        workshop_title: w.title,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.submitMsg.set(res.success ? 'Registration submitted! We will contact you shortly.' : (res.error ?? 'Failed.'));
          if (res.success) this.form.reset();
        },
        error: () => {
          this.submitting.set(false);
          this.submitMsg.set('Unable to register. Please try again.');
        },
      });
  }
}
