import { getThemeConfigValue } from '@render-store/sdk';

/** Resolve a palette-linked color setting (e.g. "palette", "palette:1", or a raw hex). */
export function resolveThemePaletteColor(
  config: Record<string, unknown> | null,
  raw: unknown,
  defaultIndex: number,
  fallback: string
): string {
  const palette = getThemeConfigValue(config, 'settings.colors.palette');
  const colors = Array.isArray(palette) ? (palette as unknown[]) : [];
  const at = (index: number): string => {
    const value = colors[index];
    return typeof value === 'string' && value.trim() ? value : fallback;
  };

  if (typeof raw === 'string' && raw.trim()) {
    if (raw.startsWith('#')) return raw;
    if (raw === 'palette') return at(defaultIndex);
    const match = /^palette:(\d+)$/.exec(raw.trim());
    if (match) {
      const index = Number(match[1]);
      return Number.isFinite(index) ? at(index) : at(defaultIndex);
    }
  }
  return at(defaultIndex);
}

export type GlobalProductCardColors = {
  background: string;
  text: string;
  quickAdd: boolean;
  mobileQuickAdd: boolean;
};

export function readGlobalProductCardColors(
  config: Record<string, unknown> | null
): GlobalProductCardColors {
  const background = resolveThemePaletteColor(
    config,
    getThemeConfigValue(config, 'settings.productCards.backgroundColor'),
    0,
    '#ffffff'
  );
  const text = resolveThemePaletteColor(
    config,
    getThemeConfigValue(config, 'settings.productCards.textColor'),
    1,
    '#111827'
  );

  const readBool = (value: unknown, fallback: boolean): boolean => {
    if (value === true || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'false' || value === 0 || value === '0') return false;
    return fallback;
  };

  return {
    background,
    text,
    quickAdd: readBool(getThemeConfigValue(config, 'settings.productCards.quickAdd'), true),
    mobileQuickAdd: readBool(
      getThemeConfigValue(config, 'settings.productCards.mobileQuickAdd'),
      false
    ),
  };
}

/** Whether the currency code should be appended to product card prices. */
export function shouldShowProductCardCurrencyCode(config: Record<string, unknown> | null): boolean {
  const value = getThemeConfigValue(config, 'settings.prices.currencyCode.productCards');
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return true;
}
