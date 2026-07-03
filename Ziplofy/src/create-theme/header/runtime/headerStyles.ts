import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';

export type HeaderScheme = {
  background: string;
  color: string;
  border: string;
};

/**
 * Header colors from explicit `topRowBackground` / `topRowText` settings.
 * Empty background falls back to the theme palette base; empty text inherits
 * the theme text color.
 */
export function headerColorScheme(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallback: HeaderScheme
): HeaderScheme {
  const bgRaw = cfgString(config, `${settingsBase}.topRowBackground`, '');
  const textRaw = cfgString(config, `${settingsBase}.topRowText`, '');
  const background = resolveThemePaletteColorSetting(config, bgRaw, 0, fallback.background);
  const color = textRaw
    ? resolveThemePaletteColorSetting(config, textRaw, 1, fallback.color)
    : fallback.color;
  return { background, color, border: fallback.border };
}

/**
 * Menu block colors from explicit `backgroundColor` / `textColor` settings
 * (`sections.*.blocks.menu.settings.*`). Empty background falls back to the
 * theme palette base; empty text color inherits the header text color.
 */
export function menuBlockColorScheme(
  config: Record<string, unknown> | null,
  menuSettingsBase: string,
  fallback: HeaderScheme
): HeaderScheme {
  const bgRaw = cfgString(config, `${menuSettingsBase}.backgroundColor`, '');
  const textRaw = cfgString(config, `${menuSettingsBase}.textColor`, '');
  const background = resolveThemePaletteColorSetting(config, bgRaw, 0, fallback.background);
  const color = textRaw
    ? resolveThemePaletteColorSetting(config, textRaw, 1, fallback.color)
    : fallback.color;
  return { background, color, border: fallback.border };
}

export function headerSectionWidth(
  config: Record<string, unknown> | null,
  settingsBase: string
): 'page' | 'full' {
  const w = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  return w === 'full' ? 'full' : 'page';
}

export function headerHeightPadding(
  config: Record<string, unknown> | null,
  settingsBase: string
): { paddingY: number; minHeight: number } {
  const h = cfgString(config, `${settingsBase}.headerHeight`);
  return h === 'compact' ? { paddingY: 10, minHeight: 52 } : { paddingY: 16, minHeight: 64 };
}

export function headerBorderPx(config: Record<string, unknown> | null, settingsBase: string): number {
  return Math.max(0, cfgNumber(config, `${settingsBase}.borderThickness`, 0));
}

export function headerStickyMode(
  config: Record<string, unknown> | null,
  settingsBase: string
): 'always' | 'on-scroll-up' | 'never' {
  const mode = cfgString(config, `${settingsBase}.stickyMode`, '');
  if (mode === 'always' || mode === 'on-scroll-up' || mode === 'never') return mode;
  if (cfgBool(config, `${settingsBase}.sticky`, false)) return 'always';
  return 'never';
}

export function headerSearchEnabled(config: Record<string, unknown> | null, settingsBase: string): boolean {
  if (cfgBool(config, `${settingsBase}.searchIcon`, false)) return true;
  return cfgBool(config, `${settingsBase}.showSearch`, false);
}

export function scopedHeaderCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  const sel = `[data-ziplofy-section="${sectionId}"]`;
  return trimmed.replace(/:root/g, sel).replace(/&/g, sel);
}

export function alignFromPosition(pos: string): 'flex-start' | 'center' | 'flex-end' {
  if (pos === 'center') return 'center';
  if (pos === 'right') return 'flex-end';
  return 'flex-start';
}
