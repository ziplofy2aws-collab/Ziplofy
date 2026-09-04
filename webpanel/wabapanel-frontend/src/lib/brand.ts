export const DEFAULT_BRAND = 'Codiic Panel';
export const CODIIC = 'Codiic';

const KKHS_PATTERN = /k\s*\.?\s*k\s*\.?\s*h\s*\.?\s*s(\s*media)?/gi;
const LEGACY_APP_NAME = /^(wabapanel|waba\s*panel|wapto|kkhs\s*media|k\s*\.?\s*k\s*\.?\s*h\s*\.?\s*s(\s*media)?|kkhs|k\s*\.?\s*k\s*\.?\s*h\s*\.?\s*s|codiic\s*panel)$/i;
export const LEGACY_SEO_PATTERN = /wabapanel|waba\s*panel|wapto|kkhs|k\s*\.?\s*k\s*\.?\s*h\s*\.?\s*s/i;

export function replaceKkhs(text: string, replacement = CODIIC): string {
  return String(text || '').replace(KKHS_PATTERN, replacement);
}

export function isKkhsName(name?: string | null): boolean {
  return /k\s*\.?\s*k\s*\.?\s*h\s*\.?\s*s/i.test(String(name || ''));
}

export function isLegacyBrandName(name?: string | null): boolean {
  return LEGACY_APP_NAME.test(String(name || '').trim());
}

export function normalizeBrandName(name?: string | null, fallback = DEFAULT_BRAND): string {
  const trimmed = String(name || '').trim();
  if (!trimmed || LEGACY_APP_NAME.test(trimmed)) return fallback;
  return replaceKkhs(trimmed, CODIIC);
}

/** Person/workspace names: drop KKHS-era labels instead of showing them on banners. */
export function displayPersonName(name?: string | null): string {
  const trimmed = String(name || '').trim();
  if (!trimmed || LEGACY_APP_NAME.test(trimmed)) return '';
  return replaceKkhs(trimmed, CODIIC);
}

export function isLegacySeoText(text?: string | null): boolean {
  return !text || LEGACY_SEO_PATTERN.test(String(text));
}

export function sanitizeSeoField(text?: string | null): string {
  if (!text) return '';
  return replaceKkhs(text, CODIIC);
}
