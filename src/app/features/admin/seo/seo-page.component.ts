import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SeoSettings } from '../../../core/models/cms.models';
import { SheetsApiService } from '../../../core/services/sheets-api.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-seo-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './seo-page.component.html',
  styleUrl: './seo-page.component.scss',
})
export class SeoPageComponent implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  private recordId = '';

  readonly form = this.fb.group({
    default_title: [''],
    default_description: [''],
    og_image: [''],
    twitter_handle: [''],
    keywords: [''],
    canonical_base: [''],
  });

  ngOnInit(): void {
    this.api.list<SeoSettings>({ sheet: 'SEO', pageSize: 1 }).subscribe({
      next: (res) => {
        const row = res.data?.[0];
        if (row) {
          this.recordId = row.id;
          this.form.patchValue(row as Record<string, string>);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    if (!this.recordId) return;
    this.saving.set(true);
    this.api.update('SEO', this.recordId, this.form.getRawValue()).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.snack.open(res.success ? 'SEO settings saved' : 'Save failed', 'OK', { duration: 3000 });
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Save failed', 'Dismiss', { duration: 4000 });
      },
    });
  }
}
