import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'r2-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  readonly size = input(32);
  readonly stroke = input(3);
  readonly label = input('Loading');
}
