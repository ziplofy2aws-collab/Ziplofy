import { getThemeConfigValue } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';

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
  small: 280,
  medium: 420,
  large: 560,
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
  imageFirst: boolean;
};

function readHeight(config: Record<string, unknown> | null, settingsBase: string): string {
  const raw = cfgString(config, `${settingsBase}.height`, '');
  if (raw === 'auto' || raw === 'small' || raw === 'medium' || raw === 'large') return raw;
  const legacy = cfgString(config, `${settingsBase}.mediaHeight`, 'medium');
  return legacy === 'auto' || legacy === 'small' || legacy === 'large' ? legacy : 'medium';
}

function readImageFirst(config: Record<string, unknown> | null, settingsBase: string): boolean {
  const sectionBase = settingsBase.replace(/\.settings$/, '');
  const orderRaw = getThemeConfigValue(config, `${sectionBase}.block_order`);
  if (Array.isArray(orderRaw) && orderRaw.length) {
    const order = orderRaw.map((id) => String(id));
    const imageIdx = order.indexOf('image');
    const groupIdx = order.indexOf('group');
    if (imageIdx >= 0 && groupIdx >= 0) return imageIdx <= groupIdx;
    if (imageIdx >= 0) return true;
    if (groupIdx >= 0) return false;
  }
  return cfgString(config, `${settingsBase}.mediaPosition`, 'left') !== 'right';
}

export function readImageWithTextLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): ImageWithTextLayout {
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const directionRaw = cfgString(config, `${settingsBase}.direction`, '');
  const direction: 'vertical' | 'horizontal' =
    directionRaw === 'vertical' ? 'vertical' : 'horizontal';

  const verticalOnMobile = cfgBool(config, `${settingsBase}.verticalOnMobile`, false);
  const layoutAlignment = cfgString(config, `${settingsBase}.layoutAlignment`, 'left');
  const position = cfgString(config, `${settingsBase}.position`, 'center');
  const layoutGap = cfgNumber(config, `${settingsBase}.layoutGap`, 32);
  const height = readHeight(config, settingsBase);

  return {
    scheme: SCHEMES[schemeKey] ?? SCHEMES['scheme-1'],
    direction,
    verticalOnMobile,
    layoutAlignment,
    position,
    layoutGap,
    sectionWidth:
      cfgString(config, `${settingsBase}.sectionWidth`, 'page') === 'full' ? 'full' : 'page',
    height,
    heightPx: imageWithTextMinHeight(height),
    backgroundMedia: cfgString(config, `${settingsBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${settingsBase}.backgroundImageUrl`, ''),
    backgroundColor: cfgString(config, `${settingsBase}.backgroundColor`, 'default'),
    borderStyle: cfgString(config, `${settingsBase}.borderStyle`, 'none'),
    borderThickness: cfgNumber(config, `${settingsBase}.borderThickness`, 1),
    borderOpacity: cfgNumber(config, `${settingsBase}.borderOpacity`, 100),
    borderColor: cfgString(config, `${settingsBase}.borderColor`, 'default'),
    cornerRadius: cfgNumber(config, `${settingsBase}.cornerRadius`, 0),
    backgroundOverlay: cfgBool(config, `${settingsBase}.backgroundOverlay`, false),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 40),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 40),
    customCss: cfgString(config, `${settingsBase}.customCss`, ''),
    imageFirst: readImageFirst(config, settingsBase),
  };
}

export function imageWithTextMinHeight(height: string): number | undefined {
  const px = HEIGHT_PX[height];
  return px && px > 0 ? px : undefined;
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

/** Build CSS border from Style / Thickness / Opacity / Color (Shopify-style). */
export function resolveImageWithTextBorderCss(
  config: Record<string, unknown> | null,
  layout: Pick<
    ImageWithTextLayout,
    'borderStyle' | 'borderThickness' | 'borderOpacity' | 'borderColor'
  >,
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
  return trimmed.replace(/:root/g, `[data-codiic-section="${sectionId}"]`);
}
