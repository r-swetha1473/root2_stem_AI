import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { CmsRecord, ContactMessage } from '../../../core/models/cms.models';
import { SheetsApiService } from '../../../core/services/sheets-api.service';
interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  link: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(SheetsApiService);

  readonly loading = signal(true);
  readonly stats = signal<StatCard[]>([]);
  readonly recentContacts = signal<ContactMessage[]>([]);
  readonly chartData = signal<{ label: string; value: number }[]>([]);

  readonly maxChart = computed(() =>
    Math.max(...this.chartData().map((d) => d.value), 1),
  );

  ngOnInit(): void {
    forkJoin({
      blogs: this.api.list({ sheet: 'Blogs', pageSize: 1 }),
      programs: this.api.list({ sheet: 'Programs', pageSize: 1 }),
      workshops: this.api.list({ sheet: 'Workshops', pageSize: 1 }),
      contacts: this.api.list<ContactMessage>({ sheet: 'Contacts', pageSize: 5 }),
      newsletter: this.api.list({ sheet: 'Newsletter', pageSize: 1 }),
    }).subscribe({
      next: ({ blogs, programs, workshops, contacts, newsletter }) => {
        this.stats.set([
          {
            label: 'Blog Posts',
            value: blogs.total ?? 0,
            icon: 'article',
            color: 'royal',
            link: '/admin/blogs',
          },
          {
            label: 'Programs',
            value: programs.total ?? 0,
            icon: 'school',
            color: 'green',
            link: '/admin/programs',
          },
          {
            label: 'Workshops',
            value: workshops.total ?? 0,
            icon: 'event',
            color: 'sky',
            link: '/admin/workshops',
          },
          {
            label: 'Contacts',
            value: contacts.total ?? 0,
            icon: 'mail',
            color: 'navy',
            link: '/admin/contacts',
          },
          {
            label: 'Newsletter',
            value: newsletter.total ?? 0,
            icon: 'campaign',
            color: 'green',
            link: '/admin/newsletter',
          },
        ]);

        this.recentContacts.set((contacts.data ?? []) as ContactMessage[]);
        this.chartData.set([
          { label: 'Blogs', value: blogs.total ?? 0 },
          { label: 'Programs', value: programs.total ?? 0 },
          { label: 'Workshops', value: workshops.total ?? 0 },
          { label: 'Contacts', value: contacts.total ?? 0 },
          { label: 'Newsletter', value: newsletter.total ?? 0 },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  contactName(c: CmsRecord): string {
    return String(c['name'] ?? c.title ?? 'Unknown');
  }

  isUnread(c: ContactMessage): boolean {
    return c.read === false || c.read === 'false' || !c.read;
  }
}
