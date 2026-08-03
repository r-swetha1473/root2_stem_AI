import { SheetName } from '../../../core/models/cms.models';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'select'
  | 'boolean'
  | 'image'
  | 'date'
  | 'status';

export interface AdminColumn {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  table?: boolean;
  form?: boolean;
  required?: boolean;
  placeholder?: string;
}

export interface AdminResourceConfig {
  sheet: SheetName;
  title: string;
  subtitle?: string;
  columns: AdminColumn[];
  readOnly?: boolean;
  hideAdd?: boolean;
  exportCsv?: boolean;
}

export const ADMIN_RESOURCE_CONFIGS: Record<string, AdminResourceConfig> = {
  hero: {
    sheet: 'Hero',
    title: 'Hero Section',
    subtitle: 'Homepage hero banner content',
    columns: [
      { key: 'title', label: 'Headline', type: 'text', table: true, form: true, required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', table: true, form: true },
      { key: 'description', label: 'Description', type: 'textarea', form: true },
      { key: 'badge', label: 'Badge', type: 'text', form: true },
      { key: 'image', label: 'Image', type: 'image', form: true },
      { key: 'cta_primary', label: 'Primary CTA', type: 'text', form: true },
      { key: 'cta_primary_link', label: 'Primary Link', type: 'text', form: true },
      { key: 'cta_secondary', label: 'Secondary CTA', type: 'text', form: true },
      { key: 'cta_secondary_link', label: 'Secondary Link', type: 'text', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  about: {
    sheet: 'About',
    title: 'About Sections',
    subtitle: 'Mission, vision, and founder content',
    columns: [
      { key: 'section', label: 'Section', type: 'select', options: ['mission', 'vision', 'founder', 'values'], table: true, form: true },
      { key: 'title', label: 'Title', type: 'text', table: true, form: true, required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', table: true, form: true },
      { key: 'description', label: 'Description', type: 'textarea', form: true },
      { key: 'image', label: 'Image', type: 'image', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  programs: {
    sheet: 'Programs',
    title: 'Programs',
    subtitle: 'Training programs and courses',
    columns: [
      { key: 'title', label: 'Title', type: 'text', table: true, form: true, required: true },
      { key: 'slug', label: 'Slug', type: 'text', table: true, form: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', table: true, form: true },
      { key: 'description', label: 'Description', type: 'textarea', form: true },
      { key: 'image', label: 'Image', type: 'image', form: true },
      { key: 'duration', label: 'Duration', type: 'text', table: true, form: true },
      { key: 'level', label: 'Level', type: 'text', table: true, form: true },
      { key: 'audience', label: 'Audience', type: 'text', form: true },
      { key: 'benefits', label: 'Benefits', type: 'textarea', form: true },
      { key: 'enroll_link', label: 'Enroll Link', type: 'text', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  workshops: {
    sheet: 'Workshops',
    title: 'Workshops',
    subtitle: 'Upcoming and past workshops',
    columns: [
      { key: 'title', label: 'Title', type: 'text', table: true, form: true, required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['upcoming', 'past'], table: true, form: true },
      { key: 'date', label: 'Start Date', type: 'date', table: true, form: true },
      { key: 'end_date', label: 'End Date', type: 'date', form: true },
      { key: 'venue', label: 'Venue', type: 'text', table: true, form: true },
      { key: 'trainer', label: 'Trainer', type: 'text', table: true, form: true },
      { key: 'description', label: 'Description', type: 'textarea', form: true },
      { key: 'image', label: 'Image', type: 'image', form: true },
      { key: 'register_link', label: 'Register Link', type: 'text', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  'career-paths': {
    sheet: 'CareerPaths',
    title: 'Career Paths',
    subtitle: 'Career roadmap content',
    columns: [
      { key: 'title', label: 'Title', type: 'text', table: true, form: true, required: true },
      { key: 'slug', label: 'Slug', type: 'text', table: true, form: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', table: true, form: true },
      { key: 'overview', label: 'Overview', type: 'textarea', form: true },
      { key: 'skills', label: 'Skills', type: 'textarea', form: true },
      { key: 'salary', label: 'Salary Range', type: 'text', form: true },
      { key: 'image', label: 'Image', type: 'image', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  blogs: {
    sheet: 'Blogs',
    title: 'Blog Posts',
    subtitle: 'Articles and news',
    columns: [
      { key: 'title', label: 'Title', type: 'text', table: true, form: true, required: true },
      { key: 'slug', label: 'Slug', type: 'text', table: true, form: true },
      { key: 'category', label: 'Category', type: 'text', table: true, form: true },
      { key: 'author', label: 'Author', type: 'text', table: true, form: true },
      { key: 'content', label: 'Content', type: 'richtext', form: true },
      { key: 'image', label: 'Cover Image', type: 'image', form: true },
      { key: 'tags', label: 'Tags', type: 'text', form: true },
      { key: 'read_time', label: 'Read Time', type: 'text', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  gallery: {
    sheet: 'Gallery',
    title: 'Gallery',
    subtitle: 'Photos and media',
    columns: [
      { key: 'title', label: 'Title', type: 'text', table: true, form: true, required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['workshop', 'certificates', 'events', 'videos'], table: true, form: true },
      { key: 'media_type', label: 'Media Type', type: 'select', options: ['image', 'video'], table: true, form: true },
      { key: 'image', label: 'Image', type: 'image', form: true },
      { key: 'video_url', label: 'Video URL', type: 'text', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  testimonials: {
    sheet: 'Testimonials',
    title: 'Testimonials',
    subtitle: 'Student and partner reviews',
    columns: [
      { key: 'title', label: 'Name', type: 'text', table: true, form: true, required: true },
      { key: 'role', label: 'Role', type: 'text', table: true, form: true },
      { key: 'company', label: 'Company', type: 'text', table: true, form: true },
      { key: 'description', label: 'Quote', type: 'textarea', form: true },
      { key: 'rating', label: 'Rating', type: 'number', table: true, form: true },
      { key: 'image', label: 'Photo', type: 'image', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  faqs: {
    sheet: 'FAQs',
    title: 'FAQs',
    subtitle: 'Frequently asked questions',
    columns: [
      { key: 'title', label: 'Question', type: 'text', table: true, form: true, required: true },
      { key: 'answer', label: 'Answer', type: 'textarea', form: true },
      { key: 'category', label: 'Category', type: 'text', table: true, form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  resources: {
    sheet: 'Downloads',
    title: 'Resources & Downloads',
    subtitle: 'Downloadable files and resources',
    columns: [
      { key: 'title', label: 'Title', type: 'text', table: true, form: true, required: true },
      { key: 'description', label: 'Description', type: 'textarea', form: true },
      { key: 'file_url', label: 'File URL', type: 'text', table: true, form: true },
      { key: 'file_type', label: 'File Type', type: 'text', table: true, form: true },
      { key: 'category', label: 'Category', type: 'text', table: true, form: true },
      { key: 'image', label: 'Thumbnail', type: 'image', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  statistics: {
    sheet: 'Statistics',
    title: 'Statistics',
    subtitle: 'Homepage stat counters',
    columns: [
      { key: 'title', label: 'Label', type: 'text', table: true, form: true, required: true },
      { key: 'value', label: 'Value', type: 'text', table: true, form: true },
      { key: 'suffix', label: 'Suffix', type: 'text', table: true, form: true },
      { key: 'icon', label: 'Icon', type: 'text', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  partners: {
    sheet: 'Partners',
    title: 'Partners',
    subtitle: 'Partner logos and links',
    columns: [
      { key: 'title', label: 'Name', type: 'text', table: true, form: true, required: true },
      { key: 'logo', label: 'Logo URL', type: 'image', table: true, form: true },
      { key: 'website', label: 'Website', type: 'text', table: true, form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  team: {
    sheet: 'Team',
    title: 'Team',
    subtitle: 'Team members',
    columns: [
      { key: 'title', label: 'Name', type: 'text', table: true, form: true, required: true },
      { key: 'role', label: 'Role', type: 'text', table: true, form: true },
      { key: 'bio', label: 'Bio', type: 'textarea', form: true },
      { key: 'email', label: 'Email', type: 'text', form: true },
      { key: 'linkedin', label: 'LinkedIn', type: 'text', form: true },
      { key: 'image', label: 'Photo', type: 'image', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  social: {
    sheet: 'SocialLinks',
    title: 'Social Media',
    subtitle: 'Social profile links',
    columns: [
      { key: 'title', label: 'Label', type: 'text', table: true, form: true, required: true },
      { key: 'platform', label: 'Platform', type: 'text', table: true, form: true },
      { key: 'url', label: 'URL', type: 'text', table: true, form: true },
      { key: 'icon', label: 'Icon', type: 'text', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
  footer: {
    sheet: 'Footer',
    title: 'Footer',
    subtitle: 'Footer content blocks',
    columns: [
      { key: 'title', label: 'Block Title', type: 'text', table: true, form: true, required: true },
      { key: 'description', label: 'Content', type: 'textarea', form: true },
      { key: 'quick_links', label: 'Quick Links (JSON)', type: 'textarea', form: true },
      { key: 'programs_links', label: 'Programs Links (JSON)', type: 'textarea', form: true },
      { key: 'newsletter_text', label: 'Newsletter Text', type: 'textarea', form: true },
      { key: 'display_order', label: 'Order', type: 'number', table: true, form: true },
      { key: 'status', label: 'Status', type: 'status', table: true, form: true },
    ],
  },
};

export function getAdminConfig(key: string): AdminResourceConfig | undefined {
  return ADMIN_RESOURCE_CONFIGS[key];
}
