import { cfgBool, cfgNumber, cfgString } from './config';

export type PullQuoteScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, PullQuoteScheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#4b5563' },
  'scheme-2': { background: '#ffffff', color: '#111827', muted: '#4b5563' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#475569' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#5b21b6' },
};

const HEIGHT_PX: Record<string, number> = {
  auto: 0,
  small: 200,
  medium: 280,
  large: 360,
};

export type PullQuoteLayout = {
  scheme: PullQuoteScheme;
  direction: 'vertical' | 'horizontal';
  layoutAlignment: 'left' | 'center' | 'right';
  position: string;
  layoutGap: number;
  sectionWidth: 'page' | 'full';
  height: string;
  minHeightPx: number;
  backgroundMedia: string;
  backgroundImageUrl: string;
  borderStyle: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function readPullQuoteLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): PullQuoteLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const align = cfgString(config, `${settingsBase}.layoutAlignment`, 'center');
  const height = cfgString(config, `${settingsBase}.height`, 'auto');
  const dir = cfgString(config, `${settingsBase}.direction`, 'vertical');
  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction: dir === 'horizontal' ? 'horizontal' : 'vertical',
    layoutAlignment: align === 'left' || align === 'right' ? align : 'center',
    position: cfgString(config, `${settingsBase}.position`, 'center'),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 16),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    minHeightPx: HEIGHT_PX[height] ?? 0,
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 64),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 64),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedPullQuoteCss(sectionId: string, customCss: string): string {
  const scope = `.ziplofy-pull-quote-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

export function pullQuoteContentAlign(alignment: string): 'left' | 'center' | 'right' {
  if (alignment === 'left') return 'left';
  if (alignment === 'right') return 'right';
  return 'center';
}

export function pullQuoteJustifyContent(position: string): 'flex-start' | 'center' | 'flex-end' {
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  return 'center';
}
