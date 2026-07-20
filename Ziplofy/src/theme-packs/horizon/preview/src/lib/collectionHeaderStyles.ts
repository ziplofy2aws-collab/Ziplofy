import { cfgBool, cfgNumber, cfgString } from './config';
import { resolveThemePaletteColor } from './themeGlobalProductCardStyles';
import type { FeaturedCollectionScheme } from './featuredCollectionStyles';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0]! + normalized[0], 16);
    const g = parseInt(normalized[1]! + normalized[1], 16);
    const b = parseInt(normalized[2]! + normalized[2], 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  return null;
}

function resolveCollectionHeaderBorderCss(
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

export type CollectionHeaderLayout = {
  flexDirection: 'row' | 'column';
  justifyContent: string;
  alignItems: string;
  gap: number;
  flexWrap: 'wrap' | 'nowrap';
  width: string;
  height: string | number;
  minHeight?: number;
  referenceMinHeight?: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  borderRadius: number;
  border: string | undefined;
  background: string;
  backgroundImage: string | undefined;
  backgroundSize: string | undefined;
  backgroundRepeat: string | undefined;
  color: string;
  mobileStack: boolean;
  mobileWidth: string;
};

/** Reference height so block-level % height resolves (parent has no intrinsic height). */
export const COLLECTION_HEADER_HEIGHT_REFERENCE_PX = 240;

function clampPercent(value: number, fallback = 100): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(1, value));
}

function sizeToCss(mode: string, customPct?: number): string {
  if (mode === 'fit') return 'fit-content';
  if (mode === 'custom' && customPct != null && customPct > 0) {
    return `${clampPercent(customPct)}%`;
  }
  return '100%';
}

function resolveHeaderHeightStyle(
  mode: string,
  customPct?: number
): { height: string | number; minHeight?: number } {
  if (mode === 'fit') return { height: 'auto' };
  if (mode === 'fill') {
    return { height: '100%', minHeight: COLLECTION_HEADER_HEIGHT_REFERENCE_PX };
  }
  if (mode === 'custom' && customPct != null && customPct > 0) {
    const pct = clampPercent(customPct);
    const px = Math.max(1, Math.round((COLLECTION_HEADER_HEIGHT_REFERENCE_PX * pct) / 100));
    return { height: `${pct}%`, minHeight: px };
  }
  return { height: 'auto' };
}

function mapHorizontalJustify(layoutAlignment: string): string {
  if (layoutAlignment === 'left') return 'flex-start';
  if (layoutAlignment === 'right') return 'flex-end';
  return layoutAlignment;
}

function mapVerticalCrossAlign(layoutAlignment: string): string {
  if (layoutAlignment === 'left' || layoutAlignment === 'flex-start') return 'flex-start';
  if (layoutAlignment === 'right' || layoutAlignment === 'flex-end') return 'flex-end';
  return 'center';
}

function mapVerticalMainJustify(position: string): string {
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  return 'center';
}

function positionToAlignItems(position: string, baseline: boolean): string {
  if (baseline) return 'baseline';
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  return 'center';
}

function resolveHeaderFlexAlignment(
  direction: string,
  layoutAlignment: string,
  position: string,
  alignBaseline: boolean
): { justifyContent: string; alignItems: string } {
  const isHorizontal = direction !== 'vertical';
  if (isHorizontal) {
    return {
      justifyContent: mapHorizontalJustify(layoutAlignment),
      alignItems: positionToAlignItems(position, alignBaseline),
    };
  }
  return {
    justifyContent: mapVerticalMainJustify(position),
    alignItems: mapVerticalCrossAlign(layoutAlignment),
  };
}

function resolveHeaderBackgroundColor(
  config: Record<string, unknown> | null,
  settingsBase: string,
  schemeBg: string
): string {
  const raw = cfgString(config, `${settingsBase}.backgroundColor`, 'default');
  if (raw === 'default' || !raw.trim()) return schemeBg;
  return resolveThemePaletteColor(config, raw, 0, schemeBg);
}

export function readCollectionHeaderLayout(
  config: Record<string, unknown> | null,
  settingsBase: string,
  sectionScheme: FeaturedCollectionScheme,
  lineColor: string
): CollectionHeaderLayout {
  const direction = cfgString(config, `${settingsBase}.direction`, 'horizontal');
  const layoutAlignment = cfgString(config, `${settingsBase}.layoutAlignment`, 'space-between');
  const position = cfgString(config, `${settingsBase}.position`, 'bottom');
  const alignBaseline = cfgBool(config, `${settingsBase}.alignTextBaseline`, true);
  const gap = cfgNumber(config, `${settingsBase}.layoutGap`, 12);
  const width = cfgString(config, `${settingsBase}.width`, 'fill');
  const customWidth = cfgNumber(config, `${settingsBase}.customWidth`, 100);
  const mobileWidth = cfgString(config, `${settingsBase}.mobileWidth`, 'fill');
  const height = cfgString(config, `${settingsBase}.height`, 'fit');
  const customHeight = cfgNumber(config, `${settingsBase}.customHeight`, 100);
  const bgMedia = cfgString(config, `${settingsBase}.backgroundMedia`, 'none');
  const bgUrl = cfgString(config, `${settingsBase}.backgroundImageUrl`, '').trim();
  const bgImagePosition = cfgString(config, `${settingsBase}.backgroundImagePosition`, 'cover');
  const hasBgImage = bgMedia === 'image' && Boolean(bgUrl);
  const borderStyle = cfgString(config, `${settingsBase}.borderStyle`, 'none');
  const borderThickness = cfgNumber(config, `${settingsBase}.borderThickness`, 1);
  const borderOpacity = cfgNumber(config, `${settingsBase}.borderOpacity`, 100);
  const borderColorRaw = cfgString(config, `${settingsBase}.borderColor`, 'default');
  const borderColor =
    borderColorRaw === 'default' || !borderColorRaw.trim()
      ? 'default'
      : borderColorRaw.startsWith('#')
        ? borderColorRaw
        : resolveThemePaletteColor(config, borderColorRaw, 1, lineColor);
  const radius = Math.max(0, cfgNumber(config, `${settingsBase}.cornerRadius`, 0));
  const verticalOnMobile = cfgBool(config, `${settingsBase}.verticalOnMobile`, false);

  const schemeBg = sectionScheme.background;
  const schemeColor = sectionScheme.color;
  const background = resolveHeaderBackgroundColor(config, settingsBase, schemeBg);
  const { justifyContent, alignItems } = resolveHeaderFlexAlignment(
    direction,
    layoutAlignment,
    position,
    alignBaseline
  );

  const heightStyle = resolveHeaderHeightStyle(height, customHeight);

  return {
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    justifyContent,
    alignItems,
    gap,
    flexWrap: 'wrap',
    width: sizeToCss(width, customWidth),
    height: heightStyle.height,
    minHeight: heightStyle.minHeight,
    referenceMinHeight: height === 'fit' ? undefined : COLLECTION_HEADER_HEIGHT_REFERENCE_PX,
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
    borderRadius: radius,
    border: resolveCollectionHeaderBorderCss(borderStyle, borderThickness, borderOpacity, borderColor, lineColor),
    background,
    backgroundImage: hasBgImage ? `url(${bgUrl})` : undefined,
    backgroundSize: hasBgImage ? (bgImagePosition === 'fit' ? 'contain' : 'cover') : undefined,
    backgroundRepeat: hasBgImage && bgImagePosition === 'fit' ? 'no-repeat' : undefined,
    color: schemeColor,
    mobileStack: verticalOnMobile,
    mobileWidth,
  };
}

/** Scoped CSS for mobile stack + mobile width on collection header block. */
export function collectionHeaderResponsiveCss(
  sectionId: string,
  mobileWidth: string,
  verticalOnMobile: boolean,
  mobileCustomWidth?: number
): string {
  const sel = `[data-codiic-section="${sectionId}"] [data-fc-collection-header]`;
  let css = '';
  if (verticalOnMobile) {
    css += `@media (max-width: 749px) { ${sel} { flex-direction: column !important; align-items: stretch !important; } }`;
  }
  if (mobileWidth === 'fit') {
    css += `@media (max-width: 749px) { ${sel} { width: fit-content !important; max-width: 100%; } }`;
  } else if (mobileWidth === 'fill') {
    css += `@media (max-width: 749px) { ${sel} { width: 100% !important; } }`;
  } else if (mobileWidth === 'custom' && mobileCustomWidth != null && mobileCustomWidth > 0) {
    css += `@media (max-width: 749px) { ${sel} { width: ${mobileCustomWidth}% !important; max-width: 100%; } }`;
  }
  return css;
}
