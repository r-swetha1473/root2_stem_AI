/** Shared CMS record shape used across Google Sheets tabs. */
export interface CmsRecord {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  display_order: number;
  [key: string]: unknown;
}

export interface HeroContent extends CmsRecord {
  cta_primary?: string;
  cta_primary_link?: string;
  cta_secondary?: string;
  cta_secondary_link?: string;
  badge?: string;
}

export interface AboutSection extends CmsRecord {
  section?: string;
}

export interface Program extends CmsRecord {
  duration?: string;
  certificate?: string;
  audience?: string;
  benefits?: string;
  enroll_link?: string;
  level?: string;
  slug?: string;
}

export interface Workshop extends CmsRecord {
  date?: string;
  end_date?: string;
  venue?: string;
  trainer?: string;
  agenda?: string;
  sessions?: string;
  register_link?: string;
  type?: 'upcoming' | 'past';
  capacity?: string;
  faqs?: string;
}

export interface CareerPath extends CmsRecord {
  slug?: string;
  skills?: string;
  salary?: string;
  roadmap?: string;
  career_growth?: string;
  tools?: string;
  overview?: string;
}

export interface BlogPost extends CmsRecord {
  slug?: string;
  category?: string;
  author?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  tags?: string;
  read_time?: string;
  featured?: string | boolean;
  views?: number;
}

export interface GalleryItem extends CmsRecord {
  category?: 'workshop' | 'certificates' | 'events' | 'videos' | string;
  media_type?: 'image' | 'video';
  video_url?: string;
}

export interface Testimonial extends CmsRecord {
  role?: string;
  company?: string;
  rating?: number | string;
}

export interface FaqItem extends CmsRecord {
  category?: string;
  answer?: string;
}

export interface DownloadResource extends CmsRecord {
  file_url?: string;
  file_type?: string;
  category?: string;
}

export interface ContactMessage extends CmsRecord {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  read?: string | boolean;
}

export interface NewsletterSubscriber extends CmsRecord {
  email?: string;
}

export interface WorkshopRegistration extends CmsRecord {
  name?: string;
  email?: string;
  phone?: string;
  workshop_id?: string;
  workshop_title?: string;
}

export interface SocialLink extends CmsRecord {
  platform?: string;
  url?: string;
  icon?: string;
}

export interface Statistic extends CmsRecord {
  value?: string | number;
  suffix?: string;
  icon?: string;
}

export interface Partner extends CmsRecord {
  website?: string;
  logo?: string;
}

export interface TeamMember extends CmsRecord {
  role?: string;
  bio?: string;
  linkedin?: string;
  email?: string;
}

export interface SiteSettings {
  id: string;
  site_name?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  map_embed?: string;
  logo?: string;
  favicon?: string;
  about_short?: string;
  copyright?: string;
  [key: string]: unknown;
}

export interface SeoSettings {
  id: string;
  default_title?: string;
  default_description?: string;
  og_image?: string;
  twitter_handle?: string;
  keywords?: string;
  canonical_base?: string;
  [key: string]: unknown;
}

export interface FooterContent extends CmsRecord {
  quick_links?: string;
  programs_links?: string;
  newsletter_text?: string;
}

export type SheetName =
  | 'Hero'
  | 'About'
  | 'Programs'
  | 'Workshops'
  | 'CareerPaths'
  | 'Blogs'
  | 'Gallery'
  | 'Testimonials'
  | 'FAQs'
  | 'Downloads'
  | 'Contacts'
  | 'Newsletter'
  | 'WorkshopRegistrations'
  | 'SocialLinks'
  | 'Statistics'
  | 'Partners'
  | 'Team'
  | 'Footer'
  | 'Settings'
  | 'SEO';

export type SpreadsheetKind = 'cms' | 'forms' | 'settings';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  error?: string;
}

export interface PaginatedQuery {
  sheet: SheetName;
  spreadsheet?: SpreadsheetKind;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface AuthSession {
  token: string;
  username: string;
  expiresAt: number;
}

export interface LoginPayload {
  username: string;
  password: string;
  rememberMe?: boolean;
}
