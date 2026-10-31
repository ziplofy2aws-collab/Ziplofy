import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';

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

/** Pixel heights so Small / Medium / Large are visibly different; Auto has no fixed height. */
const HEIGHT_PX: Record<string, number> = {
  auto: 0,
  small: 280,
  medium: 420,
  large: 560,
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
  /** Resolved pixel height when not auto; undefined for auto. */
  heightPx: number | undefined;
  backgroundMedia: string;
  backgroundImageUrl: string;
  backgroundColor: string;
  borderStyle: string;
  borderThickness: number;
  borderOpacity: number;
  borderColor: string;
  cornerRadius: number;
  backgroundOverlay: boolean;
  paddingTop: number;
  paddingBottom: number;
  customCss: string;
  compareFirst: boolean;
};

function readHeight(config: Record<string, unknown> | null, settingsBase: string): string {
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
  const scheme = SCHEMES[schemeKey] ?? SCHEMES['scheme-1'];
  const directionRaw = cfgString(config, `${settingsBase}.direction`, 'horizontal');
  const direction: 'vertical' | 'horizontal' =
    directionRaw === 'vertical' ? 'vertical' : 'horizontal';

  const mediaPosition = cfgString(config, `${settingsBase}.mediaPosition`, 'right');
  const compareFirst = mediaPosition === 'left';

  const verticalOnMobile = cfgBool(config, `${settingsBase}.verticalOnMobile`, false);
  const layoutAlignment = cfgString(config, `${settingsBase}.layoutAlignment`, 'space-between');
  const position = cfgString(config, `${settingsBase}.position`, 'center');
  const layoutGap = cfgNumber(config, `${settingsBase}.layoutGap`, 46);
  const backgroundMedia = cfgString(config, `${settingsBase}.backgroundMedia`, 'none');
  const backgroundImageUrl = cfgString(config, `${settingsBase}.backgroundImageUrl`, '');
  const backgroundColorRaw = cfgString(config, `${settingsBase}.backgroundColor`, 'default');
  const showBgImage = backgroundMedia === 'image' && Boolean(backgroundImageUrl.trim());
  const backgroundColor = showBgImage
    ? 'transparent'
    : !backgroundColorRaw || backgroundColorRaw === 'default'
      ? scheme.background
      : resolveThemePaletteColorSetting(config, backgroundColorRaw, 0, scheme.background);

  const height = readHeight(config, settingsBase);
  return {
    scheme,
    direction,
    verticalOnMobile,
    layoutAlignment,
    position,
    layoutGap,
    sectionWidth:
      cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    heightPx: imageCompareMinHeight(height),
    backgroundMedia,
    backgroundImageUrl,
    backgroundColor,
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    borderThickness: cfgNumber(config, `${settingsBase}.borderThickness`, 1),
    borderOpacity: cfgNumber(config, `${settingsBase}.borderOpacity`, 100),
    borderColor: cfgString(config, `${settingsBase}.borderColor`, 'default'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
    compareFirst,
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0]! + normalized[0]!, 16);
    const g = parseInt(normalized[1]! + normalized[1]!, 16);
    const b = parseInt(normalized[2]! + normalized[2]!, 16);
    if (![r, g, b].every(Number.isFinite)) return null;
    return { r, g, b };
  }
  if (normalized.length !== 6) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

/** Build CSS border from Style / Thickness / Opacity / Color. */
export function resolveImageCompareBorderCss(
  config: Record<string, unknown> | null,
  layout: {
    borderStyle: string;
    borderThickness: number;
    borderOpacity: number;
    borderColor: string;
  },
  schemeBorder: string
): string | undefined {
  if (layout.borderStyle !== 'solid' || layout.borderThickness <= 0) return undefined;
  const borderColorHex =
    !layout.borderColor || layout.borderColor === 'default'
      ? schemeBorder
      : resolveThemePaletteColorSetting(config, layout.borderColor, 1, schemeBorder);
  const base = borderColorHex?.startsWith('#') ? borderColorHex : schemeBorder;
  const rgb = hexToRgb(base);
  const alpha = Math.min(100, Math.max(0, layout.borderOpacity)) / 100;
  if (!rgb) return `${layout.borderThickness}px solid ${schemeBorder}`;
  return `${layout.borderThickness}px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function imageCompareMinHeight(height: string): number | undefined {
  const px = HEIGHT_PX[height];
  return px && px > 0 ? px : undefined;
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
  return trimmed.replace(/:root/g, `[data-codiic-section="${sectionId}"]`);
}
