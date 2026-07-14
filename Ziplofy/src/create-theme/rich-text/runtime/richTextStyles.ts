import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type RichTextScheme = {
  background: string;
  color: string;
  muted: string;
};

const SCHEMES: Record<string, RichTextScheme> = {
  'scheme-1': { background: '#f6f6f7', color: '#111827', muted: '#4b5563' },
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

export type RichTextImageFit = 'cover' | 'fit' | 'stretch';

export type RichTextLayout = {
  scheme: RichTextScheme;
  direction: 'vertical' | 'horizontal';
  layoutAlignment: 'left' | 'center' | 'right';
  position: string;
  layoutGap: number;
  sectionWidth: 'page' | 'full';
  height: string;
  minHeightPx: number;
  backgroundMedia: string;
  backgroundImageUrl: string;
  backgroundImagePosition: RichTextImageFit;
  borderStyle: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  overlayColor: string;
  overlayOpacity: number;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  if (normalized.length === 6 || normalized.length === 8) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  return null;
}

function readImageFit(raw: string): RichTextImageFit {
  if (raw === 'fit' || raw === 'stretch') return raw;
  return 'cover';
}

export function richTextBackgroundImageCss(
  fit: RichTextImageFit
): { backgroundSize: string; backgroundRepeat: string } {
  if (fit === 'fit') return { backgroundSize: 'contain', backgroundRepeat: 'no-repeat' };
  if (fit === 'stretch') return { backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' };
  return { backgroundSize: 'cover', backgroundRepeat: 'no-repeat' };
}

export function richTextOverlayBackground(
  overlayColor: string,
  overlayOpacity: number
): string {
  const base = overlayColor.startsWith('#') ? overlayColor : '#000000';
  const rgb = hexToRgb(base);
  const alpha = Math.min(100, Math.max(0, overlayOpacity)) / 100;
  if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  return `rgba(0, 0, 0, ${alpha})`;
}

export function readRichTextLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): RichTextLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const align = cfgString(config, `${settingsBase}.layoutAlignment`, 'center');
  const height = cfgString(config, `${settingsBase}.height`, 'small');
  const dir = cfgString(config, `${settingsBase}.direction`, 'vertical');
  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction: dir === 'horizontal' ? 'horizontal' : 'vertical',
    layoutAlignment: richTextContentAlign(align),
    position: cfgString(config, `${settingsBase}.position`, 'center'),
    layoutGap: cfgNumber(config, `${settingsBase}.layoutGap`, 25),
    sectionWidth: cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    minHeightPx: HEIGHT_PX[height] ?? 0,
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    backgroundImagePosition: readImageFit(
      cfgString(config, `${settingsBase}.backgroundImagePosition`, 'cover')
    ),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    overlayColor: cfgString(config, `${settingsBase}.overlayColor`, '#000000'),
    overlayOpacity: cfgNumber(config, `${settingsBase}.overlayOpacity`, 35),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 48),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 48),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
  };
}

export function scopedRichTextCss(sectionId: string, customCss: string): string {
  const scope = `.codiic-rich-text-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  if (!customCss.trim()) return '';
  return `${scope} { ${customCss} }`;
}

export function richTextContentAlign(alignment: string): 'left' | 'center' | 'right' {
  if (alignment === 'left') return 'left';
  if (alignment === 'right') return 'right';
  return 'center';
}

export function richTextJustifyContent(position: string): 'flex-start' | 'center' | 'flex-end' {
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  return 'center';
}
