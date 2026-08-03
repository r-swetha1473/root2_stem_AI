import { SheetName, SpreadsheetKind } from '../models/cms.models';

/** Maps each sheet tab to one of the three Google Spreadsheets. */
export const SHEET_SPREADSHEET: Record<SheetName, SpreadsheetKind> = {
  Hero: 'cms',
  About: 'cms',
  Programs: 'cms',
  Workshops: 'cms',
  CareerPaths: 'cms',
  Blogs: 'cms',
  Gallery: 'cms',
  Testimonials: 'cms',
  FAQs: 'cms',
  Downloads: 'cms',
  Footer: 'cms',
  Contacts: 'forms',
  Newsletter: 'forms',
  WorkshopRegistrations: 'forms',
  Settings: 'settings',
  SEO: 'settings',
  SocialLinks: 'settings',
  Statistics: 'settings',
  Partners: 'settings',
  Team: 'settings',
};

export interface AdminNavItem {
  label: string;
  path: string;
  icon: string;
  exact?: boolean;
  badgeKey?: 'contacts';
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/** Linear / Vercel style grouped navigation */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/admin', icon: 'grid_view', exact: true }],
  },
  {
    label: 'Content',
    items: [
      { label: 'Hero', path: '/admin/hero', icon: 'auto_awesome' },
      { label: 'About', path: '/admin/about', icon: 'info' },
      { label: 'Programs', path: '/admin/programs', icon: 'school' },
      { label: 'Workshops', path: '/admin/workshops', icon: 'event' },
      { label: 'Career Paths', path: '/admin/career-paths', icon: 'route' },
      { label: 'Blogs', path: '/admin/blogs', icon: 'article' },
      { label: 'Gallery', path: '/admin/gallery', icon: 'photo_library' },
    ],
  },
  {
    label: 'Engage',
    items: [
      { label: 'Testimonials', path: '/admin/testimonials', icon: 'format_quote' },
      { label: 'FAQs', path: '/admin/faqs', icon: 'help_outline' },
      { label: 'Resources', path: '/admin/resources', icon: 'download' },
      { label: 'Inbox', path: '/admin/contacts', icon: 'mail', badgeKey: 'contacts' },
      { label: 'Newsletter', path: '/admin/newsletter', icon: 'campaign' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Statistics', path: '/admin/statistics', icon: 'bar_chart' },
      { label: 'Partners', path: '/admin/partners', icon: 'handshake' },
      { label: 'Team', path: '/admin/team', icon: 'groups' },
    ],
  },
  {
    label: 'Site',
    items: [
      { label: 'Website', path: '/admin/settings', icon: 'tune' },
      { label: 'Profile', path: '/admin/profile', icon: 'person_outline' },
    ],
  },
];

/** Flat list kept for any legacy consumers */
export const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

export const PUBLIC_NAV = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Programs', path: '/programs' },
  { label: 'Workshops', path: '/workshops' },
  { label: 'Careers', path: '/career-paths' },
  { label: 'Blog', path: '/blog' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
] as const;
