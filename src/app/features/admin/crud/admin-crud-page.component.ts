import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CmsRecord } from '../../../core/models/cms.models';
import { SheetsApiService } from '../../../core/services/sheets-api.service';
import {
  AdminColumn,
  AdminResourceConfig,
  getAdminConfig,
} from '../config/admin-resource.config';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { RichTextEditorComponent } from '../shared/rich-text-editor.component';
import { ImageUploadComponent } from '../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-admin-crud-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    RichTextEditorComponent,
    ImageUploadComponent,
  ],
  templateUrl: './admin-crud-page.component.html',
  styleUrl: './admin-crud-page.component.scss',
})
export class AdminCrudPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(SheetsApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly config = signal<AdminResourceConfig | null>(null);
  readonly rows = signal<CmsRecord[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly search = signal('');
  readonly statusFilter = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly panelOpen = signal(false);
  readonly editing = signal<CmsRecord | null>(null);
  form!: FormGroup;

  readonly tableColumns = computed(() => {
    const cfg = this.config();
    if (!cfg) return ['actions'];
    const cols = cfg.columns.filter((c) => c.table !== false).map((c) => c.key);
    return [...cols.slice(0, 4), 'status', 'actions'];
  });

  readonly displayColumns = computed((): AdminColumn[] => {
    const cfg = this.config();
    if (!cfg) return [];
    return cfg.columns.filter((c) => c.table !== false).slice(0, 4);
  });

  readonly formColumns = computed(() => {
    const cfg = this.config();
    return cfg?.columns.filter((c) => c.form !== false) ?? [];
  });

  ngOnInit(): void {
    const key = this.route.snapshot.data['configKey'] as string;
    const cfg = getAdminConfig(key);
    if (!cfg) return;
    this.config.set(cfg);
    this.buildForm(cfg.columns);
    this.loadRows();
  }

  loadRows(): void {
    const cfg = this.config();
    if (!cfg) return;
    this.loading.set(true);
    this.api
      .list<CmsRecord>({
        sheet: cfg.sheet,
        page: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        search: this.search() || undefined,
        status: this.statusFilter() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.data ?? []);
          this.total.set(res.total ?? 0);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.snack.open('Failed to load records', 'Dismiss', { duration: 4000 });
        },
      });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.pageIndex.set(0);
    this.loadRows();
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.pageIndex.set(0);
    this.loadRows();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadRows();
  }

  openCreate(): void {
    const cfg = this.config();
    if (!cfg || cfg.hideAdd) return;
    this.editing.set(null);
    this.form.reset({ status: 'active', display_order: this.total() + 1 });
    this.panelOpen.set(true);
  }

  openEdit(row: CmsRecord): void {
    this.editing.set(row);
    this.form.reset(row);
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
    this.editing.set(null);
  }

  save(): void {
    const cfg = this.config();
    if (!cfg || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.form.getRawValue();
    const current = this.editing();

    const req = current
      ? this.api.update(cfg.sheet, current.id, payload)
      : this.api.create(cfg.sheet, payload);

    req.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (!res.success) {
          this.snack.open(res.error ?? 'Save failed', 'Dismiss', { duration: 4000 });
          return;
        }
        this.snack.open(current ? 'Updated' : 'Created', 'OK', { duration: 2500 });
        this.closePanel();
        this.loadRows();
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Save failed', 'Dismiss', { duration: 4000 });
      },
    });
  }

  toggleStatus(row: CmsRecord): void {
    const cfg = this.config();
    if (!cfg) return;
    const next = row.status === 'active' ? 'inactive' : 'active';
    this.api.update(cfg.sheet, row.id, { status: next }).subscribe({
      next: (res) => {
        if (res.success) {
          this.rows.update((list) =>
            list.map((r) => (r.id === row.id ? { ...r, status: next } : r)),
          );
        }
      },
    });
  }

  confirmDelete(row: CmsRecord): void {
    const cfg = this.config();
    if (!cfg) return;
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Delete record?',
          message: `Remove "${row.title}" permanently?`,
          confirmLabel: 'Delete',
          danger: true,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.api.delete(cfg.sheet, row.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.snack.open('Deleted', 'OK', { duration: 2500 });
              this.loadRows();
            }
          },
        });
      });
  }

  exportCsv(): void {
    const cfg = this.config();
    if (!cfg) return;
    this.api.exportCsv(cfg.sheet).subscribe((csv) => {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cfg.sheet.toLowerCase()}-export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  cellValue(row: CmsRecord, key: string): string {
    const v = row[key];
    if (v == null) return '—';
    const s = String(v);
    return s.length > 60 ? s.slice(0, 60) + '…' : s;
  }

  imagePreviewUrl(row: CmsRecord, key: string): string | null {
    const v = row[key] ?? row['logo'];
    return v ? String(v) : null;
  }

  fieldType(col: AdminColumn): string {
    return col.type ?? 'text';
  }

  imageFolder(): string {
    return (this.config()?.sheet ?? 'uploads').toLowerCase();
  }

  private buildForm(columns: AdminColumn[]): void {
    const group: Record<string, unknown> = {};
    for (const col of columns) {
      const validators = col.required ? [Validators.required] : [];
      group[col.key] = ['', validators];
    }
    this.form = this.fb.group(group);
  }
}
