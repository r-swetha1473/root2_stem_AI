import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgramCardData } from '../../models/component.models';

@Component({
  selector: 'r2-program-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './program-card.component.html',
  styleUrl: './program-card.component.scss',
})
export class ProgramCardComponent {
  readonly program = input.required<ProgramCardData>();

  programLink(): string {
    const slug = this.program().slug;
    return slug ? `/programs/${slug}` : '/programs';
  }
}
