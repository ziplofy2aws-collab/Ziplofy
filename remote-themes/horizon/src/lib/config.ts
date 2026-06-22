import { getThemeConfigValue, useThemeConfig } from '@render-store/sdk';

export function useThemeCfg() {
  return useThemeConfig();
}

/** Merchant-facing copy defaults live in theme.default-config.json only; use fallback for layout tokens. */
export function cfgString(config: Record<string, unknown> | null, path: string, fallback = ''): string {
  const v = getThemeConfigValue(config, path);
  if (v == null || v === '') return fallback;
  return String(v);
}

export function cfgBool(config: Record<string, unknown> | null, path: string, fallback = false): boolean {
  const v = getThemeConfigValue(config, path);
  if (v == null) return fallback;
  return Boolean(v);
}

export function cfgNumber(config: Record<string, unknown> | null, path: string, fallback: number): number {
  const v = getThemeConfigValue(config, path);
  if (v == null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

type MenuItem = { label: string; href: string };

export function cfgMenuItems(
  config: Record<string, unknown> | null,
  path: string
): MenuItem[] {
  const v = getThemeConfigValue(config, path);
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object')
    .map((x) => ({
      label: String(x.label ?? ''),
      href: String(x.href ?? '/'),
    }))
    .filter((x) => x.label);
}
