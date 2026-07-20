const META_DESCRIPTION_MAX = 320;
const PAGE_TITLE_MAX = 70;
const SNIPPET_MAX = 160;

export function plainTextFromHtml(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateSeoText(value: string, max = META_DESCRIPTION_MAX): string {
  const text = value.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function joinTitle(parts: Array<string | undefined | null>): string {
  return parts.map((part) => part?.trim()).filter(Boolean).join(' - ');
}

export function slugFromTitle(title: string, fallback = 'page'): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

export function sanitizeUrlHandle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export { META_DESCRIPTION_MAX, PAGE_TITLE_MAX, SNIPPET_MAX };
