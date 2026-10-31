import { cfgNumber, cfgString } from './config';
import { footerSectionWidth, scopedFooterCss } from './footerStyles';

export type DividerScheme = {
  background: string;
  color: string;
  border: string;
};

/** Divider section backgrounds — scheme 1 matches editor canvas (#f6f6f7). */
const DIVIDER_SCHEMES: Record<string, DividerScheme> = {
  'scheme-1': { background: '#f6f6f7', color: '#111827', border: '#d1d5db' },
  'scheme-2': { background: '#f8fafc', color: '#0f172a', border: '#cbd5e1' },
  'scheme-3': { background: '#fff7ed', color: '#431407', border: '#fdba74' },
  'scheme-4': { background: '#f5f3ff', color: '#4c1d95', border: '#c4b5fd' },
};

export type DividerStyle = {
  scheme: DividerScheme;
  widthMode: 'page' | 'full';
  thickness: number;
  lengthPercent: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readDividerStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  _fallback?: DividerScheme
): DividerStyle {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  return {
    scheme: DIVIDER_SCHEMES[schemeKey] ?? DIVIDER_SCHEMES['scheme-1'],
    widthMode: footerSectionWidth(config, settingsBase),
    thickness: Math.max(0, cfgNumber(config, `${settingsBase}.thickness`, 1)),
    lengthPercent: Math.min(100, Math.max(10, cfgNumber(config, `${settingsBase}.length`, 100))),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 16),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 16),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedDividerCss(sectionId: string, css: string): string {
  return scopedFooterCss(sectionId, css);
}
