import { cfgNumber, cfgString } from '../../runtime/shared/config';

export type FooterScheme = {
  background: string;
  color: string;
  border: string;
};

const COLOR_SCHEMES: Record<string, FooterScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', border: '#e5e7eb' },
  'scheme-2': { background: '#f8fafc', color: '#0f172a', border: '#e2e8f0' },
  'scheme-3': { background: '#fff7ed', color: '#431407', border: '#fed7aa' },
  'scheme-4': { background: '#f5f3ff', color: '#4c1d95', border: '#ddd6fe' },
};

export function footerColorScheme(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallback: FooterScheme
): FooterScheme {
  const key = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  return COLOR_SCHEMES[key] ?? fallback;
}

export function footerSectionWidth(
  config: Record<string, unknown> | null,
  settingsBase: string
): 'page' | 'full' {
  return cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page';
}

export function footerGap(config: Record<string, unknown> | null, settingsBase: string): number {
  return Math.max(0, cfgNumber(config, `${settingsBase}.gap`, 20));
}

export function footerPadding(config: Record<string, unknown> | null, settingsBase: string) {
  return {
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 30),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 30),
  };
}

export function scopedFooterCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  const sel = `[data-ziplofy-section="${sectionId}"]`;
  return trimmed.replace(/:root/g, sel).replace(/&/g, sel);
}
