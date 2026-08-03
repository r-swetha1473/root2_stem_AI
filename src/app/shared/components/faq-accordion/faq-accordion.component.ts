import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FaqItemData } from '../../models/component.models';

@Component({
  selector: 'r2-faq-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatExpansionModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './faq-accordion.component.html',
  styleUrl: './faq-accordion.component.scss',
})
export class FaqAccordionComponent {
  readonly items = input.required<FaqItemData[]>();
  readonly searchable = input(true);
  readonly searchPlaceholder = input('Search FAQs…');

  readonly query = signal('');

  readonly filteredItems = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.items();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
    );
  });
}
