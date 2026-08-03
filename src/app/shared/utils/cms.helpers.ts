/** Parse "Label|/path,Label2|/path2" footer/link strings from CMS sheets. */
export function parseLinks(raw?: string): { label: string; path: string }[] {
  if (!raw) return [];
  return raw.split(',').map((item) => {
    const [label, path] = item.split('|');
    return { label: label?.trim() ?? '', path: path?.trim() || '#' };
  });
}

/** Parse pipe-separated lists from CMS (benefits, skills, agenda, etc.). */
export function parseList(raw?: string): string[] {
  if (!raw) return [];
  return raw.split('|').map((s) => s.trim()).filter(Boolean);
}

/** Parse FAQ pairs "Question? Answer.|Question2? Answer2." */
export function parseFaqs(raw?: string): { q: string; a: string }[] {
  if (!raw) return [];
  return raw.split('|').map((pair) => {
    const idx = pair.indexOf('?');
    if (idx === -1) return { q: pair.trim(), a: '' };
    return { q: pair.slice(0, idx + 1).trim(), a: pair.slice(idx + 1).trim() };
  });
}

export function formatDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
