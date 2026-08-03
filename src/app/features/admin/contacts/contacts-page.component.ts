import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContactMessage } from '../../../core/models/cms.models';
import { SheetsApiService } from '../../../core/services/sheets-api.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-contacts-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    DatePipe,
  ],
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.scss',
})
export class ContactsPageComponent implements OnInit {
  private readonly api = inject(SheetsApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly rows = signal<ContactMessage[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly search = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly selected = signal<ContactMessage | null>(null);

  readonly columns = ['name', 'email', 'subject', 'read', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .list<ContactMessage>({
        sheet: 'Contacts',
        page: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        search: this.search() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.data ?? []);
          this.total.set(res.total ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.pageIndex.set(0);
    this.load();
  }

  onPage(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  view(row: ContactMessage): void {
    this.selected.set(row);
    if (!this.isRead(row)) {
      this.markRead(row, false);
    }
  }

  isRead(row: ContactMessage): boolean {
    return row.read === true || row.read === 'true';
  }

  markRead(row: ContactMessage, showToast = true): void {
    this.api.update('Contacts', row.id, { read: true }).subscribe({
      next: (res) => {
        if (res.success) {
          this.rows.update((list) =>
            list.map((r) => (r.id === row.id ? { ...r, read: true } : r)),
          );
          if (showToast) this.snack.open('Marked as read', 'OK', { duration: 2000 });
        }
      },
    });
  }

  confirmDelete(row: ContactMessage): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Delete message?',
          message: `Remove message from ${row.name ?? row.title}?`,
          confirmLabel: 'Delete',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.api.delete('Contacts', row.id).subscribe({
          next: () => {
            this.snack.open('Deleted', 'OK', { duration: 2000 });
            if (this.selected()?.id === row.id) this.selected.set(null);
            this.load();
          },
        });
      });
  }
}
