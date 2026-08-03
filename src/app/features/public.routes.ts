import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../layout/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home').then((m) => m.Home),
      },
      {
        path: 'about',
        loadComponent: () => import('./about/about').then((m) => m.About),
      },
      {
        path: 'programs',
        loadComponent: () => import('./programs/programs').then((m) => m.Programs),
      },
      {
        path: 'programs/:slug',
        loadComponent: () =>
          import('./programs/program-detail/program-detail').then((m) => m.ProgramDetail),
      },
      {
        path: 'workshops',
        loadComponent: () => import('./workshops/workshops').then((m) => m.Workshops),
      },
      {
        path: 'workshops/:id',
        loadComponent: () =>
          import('./workshops/workshop-detail/workshop-detail').then((m) => m.WorkshopDetail),
      },
      {
        path: 'career-paths',
        loadComponent: () => import('./career-paths/career-paths').then((m) => m.CareerPaths),
      },
      {
        path: 'career-paths/:slug',
        loadComponent: () =>
          import('./career-paths/career-detail/career-detail').then((m) => m.CareerDetail),
      },
      {
        path: 'blog',
        loadComponent: () => import('./blog/blog').then((m) => m.Blog),
      },
      {
        path: 'blog/:slug',
        loadComponent: () => import('./blog/blog-detail/blog-detail').then((m) => m.BlogDetail),
      },
      {
        path: 'gallery',
        loadComponent: () => import('./gallery/gallery').then((m) => m.Gallery),
      },
      {
        path: 'faq',
        loadComponent: () => import('./faq/faq').then((m) => m.Faq),
      },
      {
        path: 'contact',
        loadComponent: () => import('./contact/contact').then((m) => m.Contact),
      },
    ],
  },
];
