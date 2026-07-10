import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type ProductHighlightScheme = {
  background: string;
  color: string;
  muted: string;
  panelLeft: string;
  panelRight: string;
};

const SCHEMES: Record<string, ProductHighlightScheme> = {
  'scheme-1': {
    background: '#ffffff',
    color: '#111827',
    muted: '#6b7280',
    panelLeft: '#ececec',
    panelRight: '#f7f5f0',
  },
  'scheme-2': {
    background: '#f8fafc',
    color: '#0f172a',
    muted: '#64748b',
    panelLeft: '#e2e8f0',
    panelRight: '#f1f5f9',
  },
  'scheme-3': {
    background: '#fff7ed',
    color: '#431407',
    muted: '#9a3412',
    panelLeft: '#ffedd5',
    panelRight: '#fff7ed',
  },
  'scheme-4': {
    background: '#f5f3ff',
    color: '#1e1b4b',
    muted: '#5b21b6',
    panelLeft: '#ede9fe',
    panelRight: '#f5f3ff',
  },
};

export type ProductHighlightLayout = {
  scheme: ProductHighlightScheme;
  sectionWidth: 'page' | 'full';
  paddingTop: number;
  paddingBottom: number;
  layoutGap: number;
  equalColumns: boolean;
  limitProductDetailsWidth: boolean;
  customCss: string;
};

export function readProductHighlightLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): ProductHighlightLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 0),
    equalColumns: cfgBool(config, `${settingsBase}.equalColumns`, true),
    limitProductDetailsWidth: cfgBool(config, `${settingsBase}.limitProductDetailsWidth`, false),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedProductHighlightCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.replace(/:root/g, `[data-ziplofy-section="${sectionId}"]`);
}
