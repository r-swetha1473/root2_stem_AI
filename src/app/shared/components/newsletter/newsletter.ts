import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SheetsApiService } from '../../../core/services/sheets-api.service';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="newsletter-form" (ngSubmit)="submit()">
      <input
        type="email"
        [(ngModel)]="email"
        name="email"
        required
        placeholder="Your email address"
        class="newsletter-input"
        aria-label="Email for newsletter"
      />
      <button type="submit" class="newsletter-btn" [disabled]="loading()">
        {{ loading() ? 'Subscribing…' : 'Subscribe' }}
      </button>
    </form>
    @if (message()) {
      <p
        class="mt-2 text-sm break-words"
        [class.text-stem-green]="success()"
        [class.text-red-300]="!success()"
      >
        {{ message() }}
      </p>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    .newsletter-form {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    .newsletter-input {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      padding: 0.75rem 1.1rem;
      font: inherit;
      font-size: 0.875rem;
      outline: none;
    }

    .newsletter-input::placeholder {
      color: rgba(255, 255, 255, 0.55);
    }

    .newsletter-input:focus {
      border-color: #00aeef;
      background: rgba(255, 255, 255, 0.12);
    }

    .newsletter-btn {
      width: 100%;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 9999px;
      padding: 0.75rem 1.25rem;
      font: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      color: #fff;
      cursor: pointer;
      background: linear-gradient(135deg, #0056b3, #00aeef);
      box-shadow: 0 8px 20px rgba(0, 86, 179, 0.28);
      white-space: nowrap;
    }

    .newsletter-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  `,
})
export class NewsletterComponent {
  private readonly api = inject(SheetsApiService);

  email = '';
  readonly loading = signal(false);
  readonly message = signal('');
  readonly success = signal(false);

  submit(): void {
    if (!this.email.trim()) return;
    this.loading.set(true);
    this.message.set('');
    this.api.subscribeNewsletter(this.email.trim()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(!!res.success);
        this.message.set(
          res.success ? 'Thanks for subscribing!' : (res.error ?? 'Something went wrong.'),
        );
        if (res.success) this.email = '';
      },
      error: () => {
        this.loading.set(false);
        this.success.set(false);
        this.message.set('Unable to subscribe. Please try again.');
      },
    });
  }
}
