import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SheetsApiService } from '../../../core/services/sheets-api.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'r2-newsletter-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, LoadingSpinnerComponent],
  templateUrl: './newsletter-form.component.html',
  styleUrl: './newsletter-form.component.scss',
})
export class NewsletterFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(SheetsApiService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly submitting = signal(false);
  readonly success = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  submit(): void {
    this.success.set(null);
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.api.subscribeNewsletter(this.form.controls.email.value).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success) {
          this.success.set(res.message ?? 'Thanks for subscribing!');
          this.form.reset();
        } else {
          this.error.set(res.error ?? 'Subscription failed. Please try again.');
        }
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Something went wrong. Please try again later.');
      },
    });
  }
}
