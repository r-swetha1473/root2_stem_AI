import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DataTableColumn } from '../../models/component.models';

@Component({
  selector: 'r2-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T extends Record<string, unknown>> {
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly rows = input.required<T[]>();
  readonly searchable = input(true);
  readonly pageSize = input(10);
  readonly pageSizeOptions = input([5, 10, 25, 50]);
  readonly showActions = input(true);
  readonly idKey = input<keyof T & string>('id');

  readonly editRow = output<T>();
  readonly deleteRow = output<T>();

  readonly query = signal('');
  readonly pageIndex = signal(0);

  readonly displayedColumns = computed(() => {
    const keys = this.columns().map((c) => c.key);
    return this.showActions() ? [...keys, 'actions'] : keys;
  });

  readonly filteredRows = computed(() => {
    const q = this.query().trim().toLowerCase();
    const data = this.rows();
    if (!q) return data;
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  });

  readonly pagedRows = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredRows().slice(start, start + this.pageSize());
  });

  readonly totalRows = computed(() => this.filteredRows().length);

  cellValue(row: T, column: DataTableColumn<T>): string {
    if (column.format) return column.format(row);
    const value = row[column.key];
    return value == null ? '—' : String(value);
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
  }

  onSearch(value: string): void {
    this.query.set(value);
    this.pageIndex.set(0);
  }
}
