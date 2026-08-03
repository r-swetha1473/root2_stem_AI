import { Routes } from '@angular/router';
import { PUBLIC_ROUTES } from './features/public.routes';
import { adminRoutes } from './features/admin/admin.routes';

export const routes: Routes = [
  ...PUBLIC_ROUTES,
  {
    path: 'admin',
    children: adminRoutes,
  },
  { path: '**', redirectTo: '' },
];
