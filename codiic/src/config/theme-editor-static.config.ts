/**
 * Static catalog theme editor — local Watch (or Horizon) pack without S3 upload.
 *
 * Enable in `.env.development` or `.env.local`:
 *
 *   VITE_STATIC_CATALOG_THEME_EDITOR_MODE=true
 *
 * Alias (same behavior):
 *
 *   VITE_THEME_EDITOR_STATIC_MODE=true
 *
 * Defaults when catalog static mode is on:
 *   - pack: watch
 *   - runtime: /remote-themes/watch/theme.js + theme.css (served from remote-themes/watch)
 *   - schema/config: /remote-themes/watch/*.json
 *
 * Open from Themes page → **Open catalog editor** → `/themes/dev-editor`
 */

function envFlag(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function envOr(defaultValue: string, ...keys: string[]): string {
  for (const key of keys) {
    const raw = import.meta.env[key] as string | undefined;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return defaultValue;
}

/** User-facing name for the catalog static-dev toggle. */
export const STATIC_CATALOG_THEME_EDITOR_MODE = envFlag(
  (import.meta.env.VITE_STATIC_CATALOG_THEME_EDITOR_MODE as string | undefined) ??
    (import.meta.env.VITE_THEME_EDITOR_STATIC_MODE as string | undefined)
);

const catalogMode = STATIC_CATALOG_THEME_EDITOR_MODE;

const defaultPack = catalogMode ? 'watch' : 'horizon';
const defaultBaseUrl = catalogMode ? '/remote-themes/watch' : '';
const defaultThemeName = catalogMode ? 'Watch (local catalog)' : 'Static dev theme';
const defaultJs = catalogMode ? '/remote-themes/watch/theme.js' : '';
const defaultCss = catalogMode ? '/remote-themes/watch/theme.css' : '';

export const THEME_EDITOR_STATIC_CONFIG = {
  /** Master toggle — when true, editor uses one local/static theme pack only. */
  enabled: catalogMode || envFlag(import.meta.env.VITE_THEME_EDITOR_STATIC_MODE),

  /** Folder name under `src/theme-packs/` when not loading from `staticBaseUrl`. */
  packId: envOr(defaultPack, 'VITE_THEME_EDITOR_STATIC_PACK'),

  /**
   * If set, JSON + assets are fetched from this URL (e.g. `/remote-themes/watch`).
   * When empty, pack is loaded from bundled `src/theme-packs/{packId}/`.
   */
  staticBaseUrl: envOr(defaultBaseUrl, 'VITE_THEME_EDITOR_STATIC_BASE_URL'),

  themeId: envOr('static-dev-watch', 'VITE_THEME_EDITOR_STATIC_THEME_ID'),
  themeName: envOr(defaultThemeName, 'VITE_THEME_EDITOR_STATIC_THEME_NAME'),

  /** Live preview runtime URLs (Watch local pack by default in catalog static mode). */
  jsUrl:
    (import.meta.env.VITE_THEME_EDITOR_STATIC_JS_URL as string | undefined)?.trim() || defaultJs,
  cssUrl:
    (import.meta.env.VITE_THEME_EDITOR_STATIC_CSS_URL as string | undefined)?.trim() || defaultCss,

  /** Fake store id for editor context when no store is selected. */
  devStoreId: envOr('dev-store', 'VITE_THEME_EDITOR_STATIC_STORE_ID'),

  localStorageKey: 'codiic-theme-editor-static-config',
} as const;

/** Set to `true` only for local UI work without API/DB. Production builds must keep this `false`. */
export const FORCE_THEME_EDITOR_STATIC_MODE = false;

export function isThemeEditorStaticMode(): boolean {
  return FORCE_THEME_EDITOR_STATIC_MODE || THEME_EDITOR_STATIC_CONFIG.enabled;
}

/** Same as static mode — preferred name for catalog editor local development. */
export function isStaticCatalogThemeEditorMode(): boolean {
  return isThemeEditorStaticMode();
}

export const THEME_EDITOR_DEV_ROUTE = '/themes/dev-editor';

/** Bundled / local packs for static catalog editor. */
export const DEV_STATIC_THEME_PACKS = [
  { id: 'watch', label: 'Watch' },
  { id: 'horizon', label: 'Horizon' },
] as const;

export type DevStaticThemePackId = (typeof DEV_STATIC_THEME_PACKS)[number]['id'];

const DEV_PACK_STORAGE_KEY = 'codiic-theme-editor-static-pack-id';

export function getStaticDevPackId(): DevStaticThemePackId {
  try {
    const stored = localStorage.getItem(DEV_PACK_STORAGE_KEY);
    if (stored === 'horizon' || stored === 'watch') return stored;
  } catch {
    /* ignore */
  }
  return THEME_EDITOR_STATIC_CONFIG.packId === 'horizon' ? 'horizon' : 'watch';
}

export function setStaticDevPackId(packId: DevStaticThemePackId): void {
  localStorage.setItem(DEV_PACK_STORAGE_KEY, packId);
}

export function configLocalStorageKeyForPack(packId: string): string {
  return `${THEME_EDITOR_STATIC_CONFIG.localStorageKey}:${packId}`;
}

export function displayNameForDevPack(packId: string): string {
  return DEV_STATIC_THEME_PACKS.find((p) => p.id === packId)?.label ?? packId;
}
