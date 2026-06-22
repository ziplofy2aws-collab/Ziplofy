import { cfgNumber, cfgString } from './config';

export type ImageCompareScheme = {
  background: string;
  color: string;
  muted: string;
  contentPanel: string;
  comparePanel: string;
};

const SCHEMES: Record<string, ImageCompareScheme> = {
  'scheme-1': {
    background: '#ffffff',
    color: '#111827',
    muted: '#4b5563',
    contentPanel: '#ffffff',
    comparePanel: '#f4f4f4',
  },
  'scheme-2': {
    background: '#f8fafc',
    color: '#0f172a',
    muted: '#64748b',
    contentPanel: '#f8fafc',
    comparePanel: '#e2e8f0',
  },
  'scheme-3': {
    background: '#eef6fb',
    color: '#0f172a',
    muted: '#475569',
    contentPanel: '#eef6fb',
    comparePanel: '#f4f4f4',
  },
  'scheme-4': {
    background: '#f5f3ff',
    color: '#1e1b4b',
    muted: '#5b21b6',
    contentPanel: '#f5f3ff',
    comparePanel: '#ececec',
  },
};

const HEIGHT_PX: Record<string, number> = {
  auto: 280,
  small: 260,
  medium: 320,
  large: 400,
};

export type ImageCompareLayout = {
  scheme: ImageCompareScheme;
  direction: 'vertical' | 'horizontal';
  verticalOnMobile: boolean;
  layoutAlignment: string;
  position: string;
  layoutGap: number;
  sectionWidth: 'page' | 'full';
  height: string;
  backgroundMedia: string;
  backgroundImageUrl: string;
  borderStyle: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
  compareFirst: boolean;
};

function readHeight(
  config: Record<string, unknown> | null,
  settingsBase: string
): string {
  const raw = cfgString(config, `${settingsBase}.height`, '');
  if (raw === 'auto' || raw === 'small' || raw === 'medium' || raw === 'large') return raw;
  const legacy = cfgString(config, `${settingsBase}.mediaHeight`, 'small');
  return legacy === 'auto' || legacy === 'medium' || legacy === 'large' ? legacy : 'small';
}

export function readImageCompareLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): ImageCompareLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const directionRaw = cfgString(config, `${settingsBase}.direction`, '');
  const direction: 'vertical' | 'horizontal' =
    directionRaw === 'vertical' ? 'vertical' : 'horizontal';

  let compareFirst = false;
  if (!directionRaw) {
    compareFirst = cfgString(config, `${settingsBase}.mediaPosition`, 'right') === 'left';
  }

  const verticalOnMobile = cfgString(config, `${settingsBase}.verticalOnMobile`, 'false') === 'true';
  const layoutAlignment = cfgString(config, `${settingsBase}.layoutAlignment`, 'space-between');
  const position = cfgString(config, `${settingsBase}.position`, 'center');
  const layoutGap = cfgNumber(config, `${settingsBase}.layoutGap`, 46);

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction,
    verticalOnMobile,
    layoutAlignment,
    position,
    layoutGap,
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height: readHeight(config, settingsBase),
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay:
      cfgString(config, `${settingsBase}.backgroundOverlay`, 'false') === 'true',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
    compareFirst,
  };
}

export function imageCompareMinHeight(height: string): number {
  return HEIGHT_PX[height] ?? HEIGHT_PX.small;
}

export function alignItemsForPosition(position: string): 'flex-start' | 'center' | 'flex-end' {
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  return 'center';
}

export function justifyContentForAlignment(alignment: string): string {
  if (alignment === 'space-between') return 'space-between';
  if (alignment === 'right') return 'flex-end';
  if (alignment === 'center') return 'center';
  return 'flex-start';
}

export function scopedImageCompareCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.replace(/:root/g, `[data-ziplofy-section="${sectionId}"]`);
}
