import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkshopCardData } from '../../models/component.models';

@Component({
  selector: 'r2-workshop-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './workshop-card.component.html',
  styleUrl: './workshop-card.component.scss',
})
export class WorkshopCardComponent {
  readonly workshop = input.required<WorkshopCardData>();
  readonly registerClick = output<WorkshopCardData>();

  isPast(): boolean {
    return this.workshop().type === 'past';
  }

  onRegister(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.registerClick.emit(this.workshop());
  }
}
