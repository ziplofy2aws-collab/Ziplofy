/**
 * Static theme editor dev mode — bypasses production S3 / store-theme-config flow.
 *
 * Enable in `.env.local` (or any Vite env file):
 *
 *   VITE_THEME_EDITOR_STATIC_MODE=true
 *
 * Optional overrides (defaults work for local dev with horizon pack in `src/theme-packs/horizon/`):
 *
 *   VITE_THEME_EDITOR_STATIC_PACK=horizon
 *   VITE_THEME_EDITOR_STATIC_BASE_URL=/static-editor-theme
 *   VITE_THEME_EDITOR_STATIC_JS_URL=http://localhost:5180/...
 *   VITE_THEME_EDITOR_STATIC_CSS_URL=http://localhost:5180/...
 *   VITE_THEME_EDITOR_STATIC_THEME_NAME=My reference theme
 *
 * When static mode is on, open `/themes/dev-editor` (no DB theme or install required).
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

export const THEME_EDITOR_STATIC_CONFIG = {
  /** Master toggle — when true, editor uses one local/static theme pack only. */
  enabled: envFlag(import.meta.env.VITE_THEME_EDITOR_STATIC_MODE),

  /** Folder name under `src/theme-packs/` when not loading from `staticBaseUrl`. */
  packId: envOr('horizon', 'VITE_THEME_EDITOR_STATIC_PACK'),

  /**
   * If set, JSON + assets are fetched from this URL (e.g. `/static-editor-theme` in `public/`
   * or a render-store static host). When empty, pack is loaded from bundled `src/theme-packs/{packId}/`.
   */
  staticBaseUrl: envOr('', 'VITE_THEME_EDITOR_STATIC_BASE_URL'),

  themeId: envOr('static-dev', 'VITE_THEME_EDITOR_STATIC_THEME_ID'),
  themeName: envOr('Static dev theme', 'VITE_THEME_EDITOR_STATIC_THEME_NAME'),

  /**
   * Live preview — empty uses create-theme composer in render-store `/theme-preview` (no theme.js).
   */
  jsUrl: (import.meta.env.VITE_THEME_EDITOR_STATIC_JS_URL as string | undefined)?.trim() || '',
  cssUrl: (import.meta.env.VITE_THEME_EDITOR_STATIC_CSS_URL as string | undefined)?.trim() || '',

  /** Fake store id for editor context when no store is selected. */
  devStoreId: envOr('dev-store', 'VITE_THEME_EDITOR_STATIC_STORE_ID'),

  localStorageKey: 'ziplofy-theme-editor-static-config',
} as const;

/** Set to `true` only for local UI work without API/DB. Production builds must keep this `false`. */
export const FORCE_THEME_EDITOR_STATIC_MODE = true;

export function isThemeEditorStaticMode(): boolean {
  return FORCE_THEME_EDITOR_STATIC_MODE || THEME_EDITOR_STATIC_CONFIG.enabled;
}

export const THEME_EDITOR_DEV_ROUTE = '/themes/dev-editor';

/** Bundled pack for static dev editor (Horizon only). */
export const DEV_STATIC_THEME_PACKS = [{ id: 'horizon', label: 'Horizon' }] as const;

export type DevStaticThemePackId = (typeof DEV_STATIC_THEME_PACKS)[number]['id'];

const DEV_PACK_STORAGE_KEY = 'ziplofy-theme-editor-static-pack-id';

export function getStaticDevPackId(): DevStaticThemePackId {
  try {
    const stored = localStorage.getItem(DEV_PACK_STORAGE_KEY);
    if (stored === 'horizon') return stored;
  } catch {
    /* ignore */
  }
  return 'horizon';
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
