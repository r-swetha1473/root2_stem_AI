import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

const DISPLAY_NAME_KEY = 'root2_admin_display_name';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  private readonly auth = inject(AuthService);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly username = this.auth.username;

  readonly form = this.fb.nonNullable.group({
    displayName: [
      localStorage.getItem(DISPLAY_NAME_KEY) || this.auth.username() || 'Admin',
      Validators.required,
    ],
  });

  save(): void {
    if (this.form.invalid) return;
    const name = this.form.getRawValue().displayName.trim();
    localStorage.setItem(DISPLAY_NAME_KEY, name);
    this.snack.open('Display name updated locally', 'OK', { duration: 3000 });
  }
}
