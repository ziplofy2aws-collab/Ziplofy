import { cfgNumber, cfgString } from '../../runtime/shared/config';

export type ImageWithTextScheme = {
  background: string;
  color: string;
  muted: string;
  imagePanel: string;
  contentPanel: string;
};

const SCHEMES: Record<string, ImageWithTextScheme> = {
  'scheme-1': {
    background: '#ffffff',
    color: '#111827',
    muted: '#4b5563',
    imagePanel: '#f0f0f0',
    contentPanel: '#ffffff',
  },
  'scheme-2': {
    background: '#f8fafc',
    color: '#0f172a',
    muted: '#64748b',
    imagePanel: '#e2e8f0',
    contentPanel: '#f8fafc',
  },
  'scheme-3': {
    background: '#eef6fb',
    color: '#0f172a',
    muted: '#475569',
    imagePanel: '#f0f0f0',
    contentPanel: '#ffffff',
  },
  'scheme-4': {
    background: '#f5f3ff',
    color: '#1e1b4b',
    muted: '#5b21b6',
    imagePanel: '#ede9fe',
    contentPanel: '#f5f3ff',
  },
};

const HEIGHT_PX: Record<string, number> = {
  auto: 0,
  small: 260,
  medium: 320,
  large: 400,
};

export type ImageWithTextLayout = {
  scheme: ImageWithTextScheme;
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
  imageFirst: boolean;
};

function readHeight(config: Record<string, unknown> | null, settingsBase: string): string {
  const raw = cfgString(config, `${settingsBase}.height`, '');
  if (raw === 'auto' || raw === 'small' || raw === 'medium' || raw === 'large') return raw;
  const legacy = cfgString(config, `${settingsBase}.mediaHeight`, 'medium');
  return legacy === 'auto' || legacy === 'small' || legacy === 'large' ? legacy : 'medium';
}

export function readImageWithTextLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): ImageWithTextLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const directionRaw = cfgString(config, `${settingsBase}.direction`, '');
  const direction: 'vertical' | 'horizontal' =
    directionRaw === 'vertical' ? 'vertical' : 'horizontal';

  let imageFirst = true;
  if (!directionRaw) {
    imageFirst = cfgString(config, `${settingsBase}.mediaPosition`, 'left') !== 'right';
  }

  const verticalOnMobile = cfgString(config, `${settingsBase}.verticalOnMobile`, 'false') === 'true';
  const layoutAlignment = cfgString(config, `${settingsBase}.layoutAlignment`, 'left');
  const position = cfgString(config, `${settingsBase}.position`, 'center');
  const layoutGap = cfgNumber(config, `${settingsBase}.layoutGap`, 32);

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction,
    verticalOnMobile,
    layoutAlignment,
    position,
    layoutGap,
    sectionWidth:
      cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height: readHeight(config, settingsBase),
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgString(config, `${settingsBase}.backgroundOverlay`, 'false') === 'true',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
    imageFirst,
  };
}

export function imageWithTextMinHeight(height: string): number | undefined {
  const px = HEIGHT_PX[height];
  return px && px > 0 ? px : undefined;
}

export function alignItemsForPosition(position: string): 'flex-start' | 'center' | 'flex-end' {
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  return 'center';
}

export function justifyContentForAlignment(alignment: string): string {
  if (alignment === 'right') return 'flex-end';
  if (alignment === 'center') return 'center';
  return 'flex-start';
}

export function scopedImageWithTextCss(sectionId: string, css: string): string {
  const trimmed = css.trim();
  if (!trimmed) return '';
  return trimmed.replace(/:root/g, `[data-ziplofy-section="${sectionId}"]`);
}
