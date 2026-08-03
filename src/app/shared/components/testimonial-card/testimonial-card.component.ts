import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TestimonialCardData } from '../../models/component.models';

@Component({
  selector: 'r2-testimonial-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './testimonial-card.component.html',
  styleUrl: './testimonial-card.component.scss',
})
export class TestimonialCardComponent {
  readonly testimonial = input.required<TestimonialCardData>();

  readonly stars = computed(() => {
    const raw = this.testimonial().rating;
    const value = typeof raw === 'string' ? parseInt(raw, 10) : (raw ?? 5);
    const count = Math.min(5, Math.max(0, Number.isFinite(value) ? value : 5));
    return Array.from({ length: count }, (_, i) => i);
  });
}
