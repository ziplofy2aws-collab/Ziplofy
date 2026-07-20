const META_DESCRIPTION_MAX = 320;

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
