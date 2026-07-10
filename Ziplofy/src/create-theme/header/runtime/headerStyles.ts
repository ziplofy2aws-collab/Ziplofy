import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type HeaderScheme = {
  background: string;
  color: string;
  border: string;
};

const COLOR_SCHEMES: Record<string, HeaderScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', border: '#e5e7eb' },
  'scheme-2': { background: '#1e3a5f', color: '#eff6ff', border: '#334155' },
  'scheme-3': { background: '#431407', color: '#fff7ed', border: '#7c2d12' },
  'scheme-4': { background: '#4c1d95', color: '#f5f3ff', border: '#6d28d9' },
};

export function headerColorScheme(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallback: HeaderScheme
): HeaderScheme {
  const key = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  return COLOR_SCHEMES[key] ?? fallback;
}

/** Menu block color scheme (`sections.*.blocks.menu.settings.colorScheme`). */
export function menuBlockColorScheme(
  config: Record<string, unknown> | null,
  menuSettingsBase: string,
  fallback: HeaderScheme
): HeaderScheme {
  const key = cfgString(config, `${menuSettingsBase}.colorScheme`, 'scheme-1');
  return COLOR_SCHEMES[key] ?? fallback;
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
