import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AuthSession, LoginPayload } from '../models/cms.models';
import { SheetsApiService } from './sheets-api.service';

const SESSION_KEY = 'root2_admin_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(SheetsApiService);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<AuthSession | null>(this.readSession());

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => {
    const s = this.sessionSignal();
    return !!s && s.expiresAt > Date.now();
  });
  readonly username = computed(() => this.sessionSignal()?.username ?? '');

  login(payload: LoginPayload): Observable<boolean> {
    return this.api.login(payload).pipe(
      tap((res) => {
        if (!res.success || !res.data) return;
        const days = payload.rememberMe ? 30 : 1;
        const session: AuthSession = {
          token: res.data.token,
          username: res.data.username,
          expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
        };
        this.persist(session, payload.rememberMe);
        this.sessionSignal.set(session);
      }),
      map((res) => !!res.success && !!res.data),
    );
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
    void this.router.navigateByUrl('/admin/login');
  }

  getToken(): string | null {
    return this.sessionSignal()?.token ?? null;
  }

  private persist(session: AuthSession, remember?: boolean): void {
    const raw = JSON.stringify(session);
    if (remember) {
      localStorage.setItem(SESSION_KEY, raw);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, raw);
      localStorage.removeItem(SESSION_KEY);
    }
  }

  private readSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as AuthSession;
      if (session.expiresAt < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }
}
