import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '../../core/guards/auth.guard';

const CRUD_PATHS = [
  'hero',
  'about',
  'programs',
  'workshops',
  'career-paths',
  'blogs',
  'gallery',
  'testimonials',
  'faqs',
  'resources',
  'statistics',
  'partners',
  'team',
] as const;

const crudRoutes: Routes = CRUD_PATHS.map((path) => ({
  path,
  loadComponent: () =>
    import('./crud/admin-crud-page.component').then((m) => m.AdminCrudPageComponent),
  data: { configKey: path },
}));

export const adminRoutes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../../layout/admin-layout/admin-layout').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      ...crudRoutes,
      {
        path: 'contacts',
        loadComponent: () =>
          import('./contacts/contacts-page.component').then((m) => m.ContactsPageComponent),
      },
      {
        path: 'newsletter',
        loadComponent: () =>
          import('./newsletter/newsletter-page.component').then((m) => m.NewsletterPageComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings-page.component').then((m) => m.SettingsPageComponent),
      },
      { path: 'seo', redirectTo: 'settings', pathMatch: 'full' },
      { path: 'social', redirectTo: 'settings', pathMatch: 'full' },
      { path: 'footer', redirectTo: 'settings', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile-page.component').then((m) => m.ProfilePageComponent),
      },
    ],
  },
];
