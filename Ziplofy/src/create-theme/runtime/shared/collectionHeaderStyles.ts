import type { CSSProperties } from 'react';
import {
  resolveThemePaletteColorSetting,
} from '../../settings/theme-color-palette.settings';
import { resolveFaqBorderCss } from '../../faq/runtime/faqStyles';
import { cfgBool, cfgNumber, cfgString } from './config';

export type CollectionHeaderScheme = {
  background: string;
  color: string;
};

export type CollectionHeaderLayout = {
  style: CSSProperties;
  /** Wrapper min-height when height is fill/custom so % height resolves. */
  referenceMinHeight?: number;
  mobileStack: boolean;
  mobileWidth: string;
  mobileCustomWidth: number;
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
): Pick<CSSProperties, 'height' | 'minHeight'> {
  if (mode === 'fit') return { height: 'auto' };
  if (mode === 'fill') {
    return {
      height: '100%',
      minHeight: COLLECTION_HEADER_HEIGHT_REFERENCE_PX,
    };
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
  return resolveThemePaletteColorSetting(config, raw, 0, schemeBg);
}

export function readCollectionHeaderLayout(
  config: Record<string, unknown> | null,
  settingsBase: string,
  scheme: CollectionHeaderScheme,
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
  const mobileCustomWidth = cfgNumber(config, `${settingsBase}.mobileCustomWidth`, 100);
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
        : resolveThemePaletteColorSetting(config, borderColorRaw, 1, lineColor);
  const radius = Math.max(0, cfgNumber(config, `${settingsBase}.cornerRadius`, 0));
  const verticalOnMobile = cfgBool(config, `${settingsBase}.verticalOnMobile`, false);
  const background = resolveHeaderBackgroundColor(config, settingsBase, scheme.background);
  const { justifyContent, alignItems } = resolveHeaderFlexAlignment(
    direction,
    layoutAlignment,
    position,
    alignBaseline
  );

  const style: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    flexWrap: 'wrap',
    justifyContent,
    alignItems,
    gap,
    width: sizeToCss(width, customWidth),
    ...resolveHeaderHeightStyle(height, customHeight),
    boxSizing: 'border-box',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
    borderRadius: radius,
    border: resolveFaqBorderCss(borderStyle, borderThickness, borderOpacity, borderColor, lineColor),
    background,
    backgroundImage: hasBgImage ? `url(${bgUrl})` : undefined,
    backgroundSize: hasBgImage ? (bgImagePosition === 'fit' ? 'contain' : 'cover') : undefined,
    backgroundPosition: hasBgImage ? 'center' : undefined,
    backgroundRepeat: hasBgImage && bgImagePosition === 'fit' ? 'no-repeat' : undefined,
    color: scheme.color,
    marginBottom: 24,
  };

  return {
    style,
    referenceMinHeight:
      height === 'fit' ? undefined : COLLECTION_HEADER_HEIGHT_REFERENCE_PX,
    mobileStack: verticalOnMobile,
    mobileWidth,
    mobileCustomWidth,
  };
}

export function collectionHeaderResponsiveCss(
  sectionId: string,
  mobileWidth: string,
  verticalOnMobile: boolean,
  mobileCustomWidth?: number
): string {
  const sel = `[data-ziplofy-section="${sectionId}"] [data-fc-collection-header]`;
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
