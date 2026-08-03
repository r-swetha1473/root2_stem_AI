import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SHEET_SPREADSHEET } from '../constants/sheets';
import { SEED, SeedStore } from '../data/seed-data';
import {
  ApiResponse,
  CmsRecord,
  LoginPayload,
  PaginatedQuery,
  SheetName,
} from '../models/cms.models';

const MOCK_KEY = 'root2_mock_store_v1';

/**
 * Google Apps Script bridge with local mock fallback.
 * When environment.apiUrl is empty (or useMockData=true), CRUD persists in localStorage.
 * Reads fall back to mock if the live sheet is not bootstrapped yet.
 */
@Injectable({ providedIn: 'root' })
export class SheetsApiService {
  private readonly http = inject(HttpClient);
  private store: SeedStore = this.loadMockStore();

  private get useMock(): boolean {
    return environment.useMockData || !environment.apiUrl || environment.apiUrl.includes('YOUR_');
  }

  /** Apps Script accepts text/plain JSON to avoid CORS preflight issues. */
  private postJson<T>(body: Record<string, unknown>): Observable<ApiResponse<T>> {
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain;charset=utf-8' });
    return this.http
      .post<ApiResponse<T>>(environment.apiUrl, JSON.stringify(body), { headers })
      .pipe(catchError((err) => this.handleError(err)));
  }

  private liveFailed(res: ApiResponse<unknown> | null | undefined): boolean {
    if (!res) return true;
    if (res.success) return false;
    const err = String(res.error || '');
    return (
      err.includes('REPLACE_') ||
      err.includes('not set') ||
      err.includes('not found') ||
      err.includes('Illegal spreadsheet') ||
      err.includes('Cannot open spreadsheet')
    );
  }

  list<T = CmsRecord>(query: PaginatedQuery): Observable<ApiResponse<T[]>> {
    if (this.useMock) {
      return of(this.mockList<T>(query));
    }
    let params = new HttpParams()
      .set('action', 'list')
      .set('sheet', query.sheet)
      .set('spreadsheet', query.spreadsheet ?? SHEET_SPREADSHEET[query.sheet]);
    if (query.page) params = params.set('page', String(query.page));
    if (query.pageSize) params = params.set('pageSize', String(query.pageSize));
    if (query.search) params = params.set('search', query.search);
    if (query.status) params = params.set('status', query.status);
    if (query.category) params = params.set('category', query.category);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortDir) params = params.set('sortDir', query.sortDir);

    return this.http.get<ApiResponse<T[]>>(environment.apiUrl, { params }).pipe(
      switchMap((res) => {
        if (this.liveFailed(res)) {
          console.warn('Sheets API unavailable — using local seed for', query.sheet, res?.error);
          return of(this.mockList<T>(query));
        }
        return of(res);
      }),
      catchError(() => of(this.mockList<T>(query))),
    );
  }

  getById<T = CmsRecord>(sheet: SheetName, id: string): Observable<ApiResponse<T>> {
    if (this.useMock) {
      const rows = (this.store[sheet as keyof SeedStore] as unknown as T[]) ?? [];
      const found = rows.find((r) => (r as CmsRecord).id === id);
      return of(
        found
          ? { success: true, data: found }
          : { success: false, error: 'Record not found' },
      );
    }
    const params = new HttpParams()
      .set('action', 'get')
      .set('sheet', sheet)
      .set('spreadsheet', SHEET_SPREADSHEET[sheet])
      .set('id', id);
    return this.http
      .get<ApiResponse<T>>(environment.apiUrl, { params })
      .pipe(catchError((err) => this.handleError(err)));
  }

  create<T = CmsRecord>(sheet: SheetName, payload: Partial<T>): Observable<ApiResponse<T>> {
    if (this.useMock) {
      return of(this.mockUpsert<T>(sheet, payload, true));
    }
    return this.postJson<T>({
      action: 'create',
      sheet,
      spreadsheet: SHEET_SPREADSHEET[sheet],
      data: payload,
    }).pipe(
      switchMap((res) => {
        if (this.liveFailed(res)) return of(this.mockUpsert<T>(sheet, payload, true));
        return of(res);
      }),
      catchError(() => of(this.mockUpsert<T>(sheet, payload, true))),
    );
  }

  update<T = CmsRecord>(
    sheet: SheetName,
    id: string,
    payload: Partial<T>,
  ): Observable<ApiResponse<T>> {
    if (this.useMock) {
      return of(this.mockUpsert<T>(sheet, { ...payload, id }, false));
    }
    return this.postJson<T>({
      action: 'update',
      sheet,
      spreadsheet: SHEET_SPREADSHEET[sheet],
      id,
      data: payload,
    }).pipe(
      switchMap((res) => {
        if (this.liveFailed(res)) return of(this.mockUpsert<T>(sheet, { ...payload, id }, false));
        return of(res);
      }),
      catchError(() => of(this.mockUpsert<T>(sheet, { ...payload, id }, false))),
    );
  }

  delete(sheet: SheetName, id: string): Observable<ApiResponse<null>> {
    if (this.useMock) {
      const key = sheet as keyof SeedStore;
      const rows = [...((this.store[key] as unknown as CmsRecord[]) ?? [])];
      this.store = {
        ...this.store,
        [key]: rows.filter((r) => r.id !== id),
      };
      this.persistMock();
      return of({ success: true, message: 'Deleted', data: null });
    }
    return this.postJson<null>({
      action: 'delete',
      sheet,
      spreadsheet: SHEET_SPREADSHEET[sheet],
      id,
    });
  }

  login(payload: LoginPayload): Observable<ApiResponse<{ token: string; username: string }>> {
    if (this.useMock) {
      const ok = payload.username === 'admin' && payload.password === 'root2admin';
      return of(
        ok
          ? {
              success: true,
              data: { token: 'mock-admin-token', username: payload.username },
              message: 'Logged in',
            }
          : { success: false, error: 'Invalid username or password' },
      );
    }
    return this.postJson<{ token: string; username: string }>({
      action: 'login',
      ...payload,
    }).pipe(
      switchMap((res) => {
        if (this.liveFailed(res) || !res.success) {
          // Allow local admin while sheet bootstrap is pending
          if (payload.username === 'admin' && payload.password === 'root2admin') {
            return of({
              success: true,
              data: { token: 'mock-admin-token', username: payload.username },
              message: 'Logged in (local fallback)',
            });
          }
        }
        return of(res);
      }),
      catchError(() => {
        if (payload.username === 'admin' && payload.password === 'root2admin') {
          return of({
            success: true,
            data: { token: 'mock-admin-token', username: payload.username },
            message: 'Logged in (local fallback)',
          });
        }
        return of({ success: false, error: 'Login failed' });
      }),
    );
  }

  /** Public form helpers */
  submitContact(data: Record<string, unknown>): Observable<ApiResponse<CmsRecord>> {
    return this.create<CmsRecord>('Contacts', {
      title: String(data['name'] ?? 'Contact'),
      name: data['name'],
      email: data['email'],
      phone: data['phone'],
      subject: data['subject'],
      message: data['message'],
      status: 'active',
      read: false,
    });
  }

  subscribeNewsletter(email: string): Observable<ApiResponse<CmsRecord>> {
    return this.create<CmsRecord>('Newsletter', {
      title: email,
      email,
      status: 'active',
    });
  }

  registerWorkshop(data: Record<string, unknown>): Observable<ApiResponse<CmsRecord>> {
    return this.create<CmsRecord>('WorkshopRegistrations', {
      title: String(data['name'] ?? 'Registration'),
      ...data,
      status: 'active',
    });
  }

  exportCsv(sheet: SheetName): Observable<string> {
    return this.list({ sheet, pageSize: 10000 }).pipe(
      map((res) => {
        const rows = (res.data ?? []) as Record<string, unknown>[];
        if (!rows.length) return '';
        const headers = Object.keys(rows[0]);
        const lines = [
          headers.join(','),
          ...rows.map((row) =>
            headers
              .map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`)
              .join(','),
          ),
        ];
        return lines.join('\n');
      }),
    );
  }

  resetMockStore(): void {
    this.store = structuredClone(SEED);
    this.persistMock();
  }

  private mockList<T>(query: PaginatedQuery): ApiResponse<T[]> {
    let rows = [...((this.store[query.sheet as keyof SeedStore] as unknown as T[]) ?? [])];
    const asRecords = rows as unknown as CmsRecord[];

    if (query.status) {
      rows = asRecords.filter((r) => r.status === query.status) as unknown as T[];
    }
    if (query.category) {
      rows = (rows as unknown as Array<Record<string, unknown>>).filter(
        (r) => String(r['category'] ?? '') === query.category,
      ) as T[];
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = (rows as unknown as Array<Record<string, unknown>>).filter((r) =>
        JSON.stringify(r).toLowerCase().includes(q),
      ) as T[];
    }

    rows = [...rows].sort((a, b) => {
      const aa = a as CmsRecord;
      const bb = b as CmsRecord;
      return (aa.display_order ?? 0) - (bb.display_order ?? 0);
    });

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 100;
    const start = (page - 1) * pageSize;
    const pageRows = rows.slice(start, start + pageSize);

    return {
      success: true,
      data: pageRows,
      total: rows.length,
      page,
      pageSize,
    };
  }

  private mockUpsert<T>(
    sheet: SheetName,
    payload: Partial<T> & { id?: string },
    isCreate: boolean,
  ): ApiResponse<T> {
    const key = sheet as keyof SeedStore;
    const rows = [...((this.store[key] as unknown as CmsRecord[]) ?? [])];
    const stamp = new Date().toISOString();

    if (isCreate || !payload.id) {
      const record = {
        ...payload,
        id: payload.id || `${sheet.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`,
        created_at: stamp,
        updated_at: stamp,
        status: ((payload as unknown) as CmsRecord).status ?? 'active',
        display_order: ((payload as unknown) as CmsRecord).display_order ?? rows.length + 1,
        title: ((payload as unknown) as CmsRecord).title ?? 'Untitled',
      } as unknown as CmsRecord;
      rows.push(record);
      this.store = { ...this.store, [key]: rows };
      this.persistMock();
      return { success: true, data: record as T, message: 'Created' };
    }

    const idx = rows.findIndex((r) => r.id === payload.id);
    if (idx < 0) return { success: false, error: 'Record not found' };
    const updated = { ...rows[idx], ...payload, updated_at: stamp } as CmsRecord;
    rows[idx] = updated;
    this.store = { ...this.store, [key]: rows };
    this.persistMock();
    return { success: true, data: updated as T, message: 'Updated' };
  }

  private loadMockStore(): SeedStore {
    try {
      const raw = localStorage.getItem(MOCK_KEY);
      if (raw) return JSON.parse(raw) as SeedStore;
    } catch {
      /* ignore */
    }
    const clone = structuredClone(SEED);
    try {
      localStorage.setItem(MOCK_KEY, JSON.stringify(clone));
    } catch {
      /* ignore */
    }
    return clone;
  }

  private persistMock(): void {
    try {
      localStorage.setItem(MOCK_KEY, JSON.stringify(this.store));
    } catch {
      /* ignore */
    }
  }

  private handleError(err: unknown) {
    console.error('Sheets API error', err);
    return throwError(() => err);
  }
}
