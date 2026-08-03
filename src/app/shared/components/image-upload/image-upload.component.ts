import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true,
    },
  ],
  template: `
    <div class="upload-wrap">
      <div class="upload-row">
        <button
          type="button"
          class="upload-btn"
          [disabled]="disabled() || uploading()"
          (click)="fileInput.click()"
        >
          <mat-icon>cloud_upload</mat-icon>
          {{ uploading() ? 'Uploading…' : buttonLabel() }}
        </button>

        @if (value()) {
          <button type="button" class="clear-btn" [disabled]="disabled() || uploading()" (click)="clear()">
            <mat-icon>delete</mat-icon>
            Remove
          </button>
        }
      </div>

      <input
        #fileInput
        type="file"
        class="sr-only"
        [accept]="accept()"
        [disabled]="disabled() || uploading()"
        (change)="onFile($event)"
      />

      @if (uploading()) {
        <mat-progress-bar mode="indeterminate" class="progress" />
      }

      <label class="url-label">{{ label() }} URL</label>
      <input
        class="url-input"
        type="url"
        [value]="value()"
        [disabled]="disabled() || uploading()"
        [placeholder]="placeholder()"
        (input)="onUrlInput($event)"
      />

      @if (value()) {
        <div class="preview-box">
          <img [src]="value()" [alt]="label() + ' preview'" />
        </div>
      }

      <p class="hint">Uploads to Cloudinary folder <strong>Root2 STEM AI</strong></p>
    </div>
  `,
  styles: `
    :host { display: block; font-family: Inter, system-ui, sans-serif; }
    .upload-wrap { display: grid; gap: 0.65rem; }
    .upload-row { display: flex; flex-wrap: wrap; gap: 0.55rem; }
    .upload-btn, .clear-btn {
      display: inline-flex; align-items: center; gap: 0.4rem;
      height: 40px; padding: 0 0.95rem; border-radius: 12px;
      font: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer;
      border: 1px solid rgba(15, 23, 42, 0.1); transition: transform .15s ease;
    }
    .upload-btn {
      background: linear-gradient(135deg, #0056b3, #00aeef); color: #fff; border: 0;
      box-shadow: 0 8px 18px rgba(0, 86, 179, 0.2);
    }
    .clear-btn { background: #fff; color: #b91c1c; }
    .upload-btn:disabled, .clear-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
    .upload-btn:not(:disabled):hover, .clear-btn:not(:disabled):hover { transform: translateY(-1px); }
    .sr-only {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0); border: 0;
    }
    .progress { border-radius: 999px; overflow: hidden; }
    .url-label { font-size: 0.78rem; font-weight: 600; color: #64748b; }
    .url-input {
      width: 100%; height: 44px; border-radius: 12px; border: 1px solid rgba(15, 23, 42, 0.12);
      padding: 0 0.9rem; font: inherit; font-size: 0.9rem; background: #fff; color: inherit;
      outline: none;
    }
    .url-input:focus { border-color: #0056b3; box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.12); }
    .preview-box {
      width: fit-content; max-width: 100%; padding: 0.5rem; border-radius: 14px;
      border: 1px solid rgba(15, 23, 42, 0.08); background: #f8fafc;
    }
    .preview-box img { display: block; max-width: 200px; max-height: 140px; object-fit: contain; border-radius: 10px; }
    .hint { margin: 0; font-size: 0.75rem; color: #94a3b8; }
    :host-context(html.admin-dark) .url-input,
    :host-context(html.admin-dark) .clear-btn,
    :host-context(html.admin-dark) .preview-box { background: #0b1220; border-color: rgba(255,255,255,.1); }
  `,
})
export class ImageUploadComponent implements ControlValueAccessor {
  private readonly cloudinary = inject(CloudinaryService);
  private readonly toast = inject(ToastService);

  readonly label = input('Image');
  readonly buttonLabel = input('Upload Image');
  readonly accept = input('image/*');
  readonly placeholder = input('https://… or upload above');
  readonly folder = input<string | undefined>(undefined);

  readonly value = signal('');
  readonly uploading = signal(false);
  readonly disabled = signal(false);

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onUrlInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }

  clear(): void {
    this.value.set('');
    this.onChange('');
    this.onTouched();
  }

  onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.error('Please choose an image file');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      this.toast.error('Image must be under 8MB');
      return;
    }

    this.uploading.set(true);
    this.cloudinary.uploadImage(file, this.folder()).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.value.set(res.secure_url);
        this.onChange(res.secure_url);
        this.onTouched();
        this.toast.success('Image uploaded to Cloudinary');
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error(
          'Cloudinary upload failed. Create an unsigned preset named "root2_stem_ai" for cloud vondzooh.',
        );
      },
    });
  }
}
