import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { ADMIN_NAV_GROUPS } from '../../core/constants/sheets';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SheetsApiService } from '../../core/services/sheets-api.service';

const DISPLAY_NAME_KEY = 'root2_admin_display_name';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly api = inject(SheetsApiService);
  private readonly router = inject(Router);

  readonly groups = ADMIN_NAV_GROUPS;
  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly themeMode = this.theme.mode;
  readonly unreadCount = signal(0);
  readonly pageTitle = signal('Dashboard');
  readonly searchQuery = signal('');

  readonly displayName = signal(
    localStorage.getItem(DISPLAY_NAME_KEY) || this.auth.username() || 'Admin',
  );

  ngOnInit(): void {
    this.theme.applyStored();
    this.api.list({ sheet: 'Contacts', pageSize: 200 }).subscribe((res) => {
      this.unreadCount.set((res.data ?? []).filter((c) => !c['read']).length);
    });

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.syncTitle();
      this.mobileOpen.set(false);
    });
    this.syncTitle();
  }

  private syncTitle(): void {
    const path = this.router.url.split('?')[0];
    const item = this.groups.flatMap((g) => g.items).find((i) =>
      i.exact ? path === i.path : path.startsWith(i.path) && i.path !== '/admin',
    );
    this.pageTitle.set(item?.label ?? (path === '/admin' ? 'Dashboard' : 'Admin'));
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  toggleSidebar(): void {
    if (window.innerWidth < 1024) {
      this.mobileOpen.update((v) => !v);
    } else {
      this.collapsed.update((v) => !v);
    }
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchQuery.set(value);
  }

  filteredGroups() {
    const q = this.searchQuery();
    if (!q) return this.groups;
    return this.groups
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => i.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }
}
