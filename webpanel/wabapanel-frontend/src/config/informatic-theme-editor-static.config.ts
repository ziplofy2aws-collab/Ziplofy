/**
 * Static Informatic theme editor — local pack without upload/install.
 *
 * Enable in `.env.development` or `.env.local`:
 *
 *   NEXT_PUBLIC_STATIC_INFORMATIC_THEME_EDITOR_MODE=true
 */

function envFlag(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function envOr(defaultValue: string, ...keys: string[]): string {
  for (const key of keys) {
    const raw = process.env[key];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return defaultValue;
}

const informaticMode = envFlag(
  process.env.NEXT_PUBLIC_STATIC_INFORMATIC_THEME_EDITOR_MODE ??
    process.env.NEXT_PUBLIC_THEME_EDITOR_STATIC_MODE
);

/** Force off in production builds even if env leaks. */
const FORCE_OFF = process.env.NODE_ENV === 'production';

export const THEME_EDITOR_STATIC_CONFIG = {
  enabled: !FORCE_OFF && informaticMode,
  packId: envOr('informatic', 'NEXT_PUBLIC_THEME_EDITOR_STATIC_PACK'),
  staticBaseUrl: envOr('/remote-themes/informatic', 'NEXT_PUBLIC_THEME_EDITOR_STATIC_BASE_URL'),
  themeId: envOr('static-dev-informatic', 'NEXT_PUBLIC_THEME_EDITOR_STATIC_THEME_ID'),
  themeName: envOr('Informatic (local)', 'NEXT_PUBLIC_THEME_EDITOR_STATIC_THEME_NAME'),
  localStorageKey: 'webpanel-informatic-theme-editor-static-config',
} as const;

export function isStaticInformaticThemeEditorMode(): boolean {
  return THEME_EDITOR_STATIC_CONFIG.enabled;
}

export const INFORMATIC_THEME_EDITOR_DEV_ROUTE = '/client/themes/informatic-editor';

export const DEV_STATIC_INFORMATIC_PACKS = [{ id: 'informatic', label: 'Informatic' }] as const;
