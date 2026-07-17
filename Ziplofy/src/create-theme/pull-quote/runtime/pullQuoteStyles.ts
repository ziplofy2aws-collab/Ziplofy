import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

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

/** Fixed pixel floors so Small / Medium / Large clear typical quote content. */
const HEIGHT_MIN_PX: Record<string, number | undefined> = {
  auto: undefined,
  small: 320,
  medium: 480,
  large: 640,
};

export type PullQuoteLayout = {
  scheme: PullQuoteScheme;
  direction: 'vertical' | 'horizontal';
  layoutAlignment: 'left' | 'center' | 'right';
  position: string;
  layoutGap: number;
  sectionWidth: 'page' | 'full';
  height: string;
  minHeightPx: number | undefined;
  backgroundMedia: string;
  backgroundImageUrl: string;
  borderStyle: string;
  borderThickness: number;
  borderOpacity: number;
  borderColor: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

export function resolvePullQuoteMinHeightPx(heightKey: string): number | undefined {
  return HEIGHT_MIN_PX[heightKey];
}

export function readPullQuoteLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): PullQuoteLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const align = cfgString(config, `${settingsBase}.layoutAlignment`, 'center');
  const configuredHeight = cfgString(config, `${settingsBase}.height`, 'small');
  const height =
    configuredHeight === 'medium' || configuredHeight === 'large' ? configuredHeight : 'small';
  const dir = cfgString(config, `${settingsBase}.direction`, 'vertical');
  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction: dir === 'horizontal' ? 'horizontal' : 'vertical',
    layoutAlignment: align === 'left' || align === 'right' ? align : 'center',
    position: cfgString(config, `${settingsBase}.position`, 'center'),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 16),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    minHeightPx: resolvePullQuoteMinHeightPx(height),
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    borderThickness: cfgNumber(config, `${settingsBase}.borderThickness`, 1),
    borderOpacity: cfgNumber(config, `${settingsBase}.borderOpacity`, 100),
    borderColor: cfgString(config, `${settingsBase}.borderColor`, 'default'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 64),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 64),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedPullQuoteCss(sectionId: string, customCss: string): string {
  const scope = `.codiic-pull-quote-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
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

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace(/^#/, '');
  const normalized =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

/** Build CSS border from Style / Thickness / Opacity / Color (Shopify-style). */
export function resolvePullQuoteBorderCss(
  borderStyle: string,
  thickness: number,
  opacity: number,
  borderColor: string,
  schemeBorder: string
): string | undefined {
  if (borderStyle !== 'solid' || thickness <= 0) return undefined;
  const base =
    !borderColor || borderColor === 'default'
      ? schemeBorder
      : borderColor.startsWith('#')
        ? borderColor
        : schemeBorder;
  const rgb = hexToRgb(base);
  const alpha = Math.min(100, Math.max(0, opacity)) / 100;
  if (!rgb) return `${thickness}px solid ${schemeBorder}`;
  return `${thickness}px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
