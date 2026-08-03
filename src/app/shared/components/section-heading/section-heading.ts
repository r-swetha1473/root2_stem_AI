import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  standalone: true,
  template: `
    <div class="text-center max-w-3xl mx-auto mb-12 md:mb-16">
      @if (eyebrow()) {
        <p class="text-sm font-semibold uppercase tracking-widest text-sky mb-3">{{ eyebrow() }}</p>
      }
      <h2 class="text-3xl md:text-5xl font-bold mb-4">
        @if (highlight()) {
          <span class="gradient-text">{{ highlight() }}</span>
          @if (titleRest()) {
            <span> {{ titleRest() }}</span>
          }
        } @else {
          {{ title() }}
        }
      </h2>
      @if (subtitle()) {
        <p class="text-lg text-navy/70 leading-relaxed">{{ subtitle() }}</p>
      }
    </div>
  `,
})
export class SectionHeadingComponent {
  eyebrow = input('');
  title = input('');
  highlight = input('');
  titleRest = input('');
  subtitle = input('');
}
