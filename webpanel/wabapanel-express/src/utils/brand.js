const DEFAULT_BRAND = 'Codiic Panel';
const CODIIC = 'Codiic';

/** Matches KKHS / K K H S / KKHS Media (any spacing or dots). */
const KKHS_PATTERN = /k\s*\.?\s*k\s*\.?\s*h\s*\.?\s*s(\s*media)?/gi;

/** Legacy product names that should display as Codiic Panel. */
const LEGACY_APP_NAME = /^(wabapanel|waba\s*panel|wapto|kkhs\s*media|k\s*\.?\s*k\s*\.?\s*h\s*\.?\s*s(\s*media)?|kkhs|k\s*\.?\s*k\s*\.?\s*h\s*\.?\s*s|codiic\s*panel)$/i;

/** Legacy names embedded in SEO copy (substring match). */
const LEGACY_SEO_PATTERN = /wabapanel|waba\s*panel|wapto|kkhs|k\s*\.?\s*k\s*\.?\s*h\s*\.?\s*s/i;

function containsKkhs(text) {
  if (text == null || typeof text !== 'string') return false;
  KKHS_PATTERN.lastIndex = 0;
  return KKHS_PATTERN.test(text);
}

function replaceKkhs(text, replacement = CODIIC) {
  if (text == null || typeof text !== 'string') return text;
  return text.replace(KKHS_PATTERN, replacement);
}

function normalizeBrandName(name, fallback = DEFAULT_BRAND) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return fallback;
  if (LEGACY_APP_NAME.test(trimmed)) return fallback;
  return replaceKkhs(trimmed, CODIIC);
}

function sanitizeTagline(tagline) {
  const t = String(tagline || '').trim();
  if (!t || containsKkhs(t)) return '';
  return replaceKkhs(t, CODIIC);
}

function isLegacySeoText(text) {
  return !text || LEGACY_SEO_PATTERN.test(String(text));
}

function sanitizeSeoField(text) {
  if (!text || typeof text !== 'string') return text;
  return replaceKkhs(text, CODIIC);
}

function deepReplaceKkhs(value) {
  if (value == null) return value;
  if (typeof value === 'string') return replaceKkhs(value, CODIIC);
  if (Array.isArray(value)) return value.map(deepReplaceKkhs);
  if (typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) out[key] = deepReplaceKkhs(val);
    return out;
  }
  return value;
}

function sanitizePublicContent(data) {
  return deepReplaceKkhs(data);
}

module.exports = {
  DEFAULT_BRAND,
  CODIIC,
  LEGACY_APP_NAME,
  LEGACY_SEO_PATTERN,
  containsKkhs,
  replaceKkhs,
  normalizeBrandName,
  sanitizeTagline,
  isLegacySeoText,
  sanitizeSeoField,
  deepReplaceKkhs,
  sanitizePublicContent,
};
