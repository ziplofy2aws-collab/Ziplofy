import { cfgBool, cfgNumber, cfgString } from './config';

export type FooterUtilitiesScheme = {
  background: string;
  color: string;
  muted: string;
  border: string;
};

const COLOR_SCHEMES: Record<string, FooterUtilitiesScheme> = {
  'scheme-1': { background: '#f3f4f6', color: '#111827', muted: '#6b7280', border: '#e5e7eb' },
  'scheme-2': { background: '#f8fafc', color: '#0f172a', muted: '#64748b', border: '#e2e8f0' },
  'scheme-3': { background: '#fff7ed', color: '#431407', muted: '#9a3412', border: '#fed7aa' },
  'scheme-4': { background: '#f5f3ff', color: '#4c1d95', muted: '#6d28d9', border: '#ddd6fe' },
};

export function footerUtilitiesColorScheme(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallback: FooterUtilitiesScheme
): FooterUtilitiesScheme {
  const key = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  return COLOR_SCHEMES[key] ?? fallback;
}

export function footerUtilitiesSectionWidth(
  config: Record<string, unknown> | null,
  settingsBase: string
): 'page' | 'full' {
  return cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page';
}

export function footerUtilitiesGap(config: Record<string, unknown> | null, settingsBase: string): number {
  return Math.max(0, cfgNumber(config, `${settingsBase}.gap`, 24));
}

export function footerUtilitiesDividerPx(
  config: Record<string, unknown> | null,
  settingsBase: string
): number {
  return Math.max(0, cfgNumber(config, `${settingsBase}.dividerThickness`, 0));
}

export function footerUtilitiesPadding(config: Record<string, unknown> | null, settingsBase: string) {
  return {
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 20),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
  };
}

export function footerUtilitiesShowPaymentIcons(
  config: Record<string, unknown> | null,
  settingsBase: string
): boolean {
  return cfgBool(config, `${settingsBase}.paymentIcons`, false);
}

export function scopedFooterUtilitiesCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  const sel = `[data-ziplofy-section="${sectionId}"]`;
  return trimmed.replace(/:root/g, sel).replace(/&/g, sel);
}
