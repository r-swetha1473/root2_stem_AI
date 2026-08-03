import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snack = inject(MatSnackBar);

  success(message: string): void {
    this.snack.open(message, undefined, {
      duration: 2800,
      panelClass: ['toast-success'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  error(message: string): void {
    this.snack.open(message, 'Dismiss', {
      duration: 4200,
      panelClass: ['toast-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  info(message: string): void {
    this.snack.open(message, undefined, {
      duration: 2600,
      panelClass: ['toast-info'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
