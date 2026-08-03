export interface ProgramCardData {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  duration?: string;
  level?: string;
  slug?: string;
}

export interface WorkshopCardData {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  date?: string;
  end_date?: string;
  venue?: string;
  trainer?: string;
  type?: 'upcoming' | 'past' | string;
  register_link?: string;
  slug?: string;
}

export interface BlogCardData {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  category?: string;
  read_time?: string;
  slug?: string;
  author?: string;
}

export interface TestimonialCardData {
  title: string;
  description?: string;
  image?: string;
  role?: string;
  company?: string;
  rating?: number | string;
}

export interface FaqItemData {
  title: string;
  answer: string;
}

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

export interface EmptyStateCta {
  label: string;
  link: string;
}

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface DataTableColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  width?: string;
  format?: (row: T) => string;
}
