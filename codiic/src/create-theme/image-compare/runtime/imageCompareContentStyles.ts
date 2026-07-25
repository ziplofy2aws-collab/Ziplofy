import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { atMobileBreakpoint } from '../../runtime/shared/responsive';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import {
  resolveImageCompareBorderCss,
  type ImageCompareScheme,
} from './imageCompareStyles';

function clampPercent(value: number, fallback = 100): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(1, value));
}

function sizeCss(mode: string, percent: number): string {
  if (mode === 'fill') return '100%';
  if (mode === 'custom') return `${clampPercent(percent)}%`;
  return 'auto';
}

function groupBase(settingsBase: string): string {
  return `${settingsBase}.contentGroup`;
}

function hasNested(config: Record<string, unknown> | null, path: string): boolean {
  if (!config) return false;
  let cur: unknown = config;
  for (const p of path.split('.')) {
    if (cur == null || typeof cur !== 'object' || !(p in (cur as object))) return false;
    cur = (cur as Record<string, unknown>)[p];
  }
  return true;
}

function readGroupString(
  config: Record<string, unknown> | null,
  settingsBase: string,
  key: string,
  legacyKey: string,
  fallback: string
): string {
  const nestedPath = `${groupBase(settingsBase)}.${key}`;
  if (hasNested(config, nestedPath)) {
    return cfgString(config, nestedPath, fallback);
  }
  return cfgString(config, `${settingsBase}.${legacyKey}`, fallback);
}

function readGroupNumber(
  config: Record<string, unknown> | null,
  settingsBase: string,
  key: string,
  legacyKey: string,
  fallback: number
): number {
  const nestedPath = `${groupBase(settingsBase)}.${key}`;
  if (hasNested(config, nestedPath)) {
    return cfgNumber(config, nestedPath, fallback);
  }
  return cfgNumber(config, `${settingsBase}.${legacyKey}`, fallback);
}

function readGroupBool(
  config: Record<string, unknown> | null,
  settingsBase: string,
  key: string,
  legacyKey: string,
  fallback: boolean
): boolean {
  const nestedPath = `${groupBase(settingsBase)}.${key}`;
  if (hasNested(config, nestedPath)) {
    return cfgBool(config, nestedPath, fallback);
  }
  return cfgBool(config, `${settingsBase}.${legacyKey}`, fallback);
}

function mapAlignment(raw: string): 'left' | 'center' | 'right' {
  if (raw === 'center' || raw === 'flex-center') return 'center';
  if (raw === 'right' || raw === 'flex-end') return 'right';
  return 'left';
}

function mapPositionJustify(position: string): 'flex-start' | 'center' | 'flex-end' {
  if (position === 'bottom') return 'flex-end';
  if (position === 'center') return 'center';
  return 'flex-start';
}

export type ImageCompareContentStyle = {
  shell: CSSProperties;
  mobileWidthCss: string;
  mobileClass: string;
  linkUrl: string;
  openInNewTab: boolean;
  bgImage: string | null;
  showOverlay: boolean;
  textAlign: 'left' | 'center' | 'right';
  alignItems: 'flex-start' | 'center' | 'flex-end';
  /** Main-axis placement for text + buttons (Content Position). */
  stackJustify: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  direction: 'horizontal' | 'vertical';
  gap: number;
  /** Section Layout places this content block inside the column. */
  sectionAlignItems: 'flex-start' | 'center' | 'flex-end';
  sectionJustify: 'flex-start' | 'center' | 'flex-end' | 'space-between';
};

/**
 * Content block styles.
 * Layout (direction / alignment / position / gap) comes from contentGroup.
 * Section Layout only places the Content block inside its column.
 */
export function readImageCompareContentStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  sectionScheme: ImageCompareScheme,
  sectionId: string,
  panelMinHeight: number | undefined,
  isSectionHorizontal: boolean,
  sectionPosition: string,
  sectionAlignment: string
): ImageCompareContentStyle {
  const directionRaw = readGroupString(config, settingsBase, 'direction', 'contentDirection', 'vertical');
  const direction: 'horizontal' | 'vertical' =
    directionRaw === 'horizontal' ? 'horizontal' : 'vertical';

  const groupAlignmentRaw = readGroupString(
    config,
    settingsBase,
    'layoutAlignment',
    'contentAlignment',
    'center'
  );
  const alignment = mapAlignment(groupAlignmentRaw);
  const groupPosition = readGroupString(config, settingsBase, 'position', 'contentPosition', 'center');
  const gap = readGroupNumber(config, settingsBase, 'layoutGap', 'contentGap', 30);

  const widthMode = readGroupString(config, settingsBase, 'width', 'contentWidth', 'fit');
  const mobileWidthMode = readGroupString(
    config,
    settingsBase,
    'mobileWidth',
    'contentMobileWidth',
    'fill'
  );
  const heightMode = readGroupString(config, settingsBase, 'height', 'contentHeight', 'fit');
  const customWidth = readGroupNumber(config, settingsBase, 'customWidth', 'contentCustomWidth', 100);
  const mobileCustomWidth = readGroupNumber(
    config,
    settingsBase,
    'mobileCustomWidth',
    'contentMobileCustomWidth',
    100
  );
  const customHeight = readGroupNumber(config, settingsBase, 'customHeight', 'contentCustomHeight', 100);

  const bgMedia = readGroupString(config, settingsBase, 'backgroundMedia', 'contentBackgroundMedia', 'none');
  const bgImageUrl = readGroupString(
    config,
    settingsBase,
    'backgroundImageUrl',
    'contentBackgroundImageUrl',
    ''
  );
  const backgroundColorRaw = readGroupString(
    config,
    settingsBase,
    'backgroundColor',
    'contentBackgroundColor',
    'default'
  );
  const borderStyle = readGroupString(config, settingsBase, 'borderStyle', 'contentBorderStyle', 'none');
  const borderThickness = readGroupNumber(
    config,
    settingsBase,
    'borderThickness',
    'contentBorderThickness',
    1
  );
  const borderOpacity = readGroupNumber(
    config,
    settingsBase,
    'borderOpacity',
    'contentBorderOpacity',
    100
  );
  const borderColor = readGroupString(
    config,
    settingsBase,
    'borderColor',
    'contentBorderColor',
    'default'
  );
  const cornerRadius = readGroupNumber(config, settingsBase, 'cornerRadius', 'contentCornerRadius', 0);
  const backgroundOverlay = readGroupBool(
    config,
    settingsBase,
    'backgroundOverlay',
    'contentBackgroundOverlay',
    false
  );
  const paddingTop = readGroupNumber(config, settingsBase, 'paddingTop', 'contentPaddingTop', 0);
  const paddingBottom = readGroupNumber(config, settingsBase, 'paddingBottom', 'contentPaddingBottom', 0);
  const paddingLeft = readGroupNumber(config, settingsBase, 'paddingLeft', 'contentPaddingLeft', 0);
  const paddingRight = readGroupNumber(config, settingsBase, 'paddingRight', 'contentPaddingRight', 0);
  const linkUrl = readGroupString(config, settingsBase, 'linkUrl', 'contentLinkUrl', '');
  const openInNewTab = readGroupBool(
    config,
    settingsBase,
    'openLinkInNewTab',
    'contentOpenInNewTab',
    false
  );

  const alignItems: ImageCompareContentStyle['alignItems'] =
    alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';
  const positionJustify = mapPositionJustify(groupPosition);
  const stackJustify: ImageCompareContentStyle['stackJustify'] = positionJustify;
  const textAlign = alignment;

  // Section Layout places the Content block inside the grid column.
  const sectionAlignItems: ImageCompareContentStyle['sectionAlignItems'] =
    sectionAlignment === 'center'
      ? 'center'
      : sectionAlignment === 'right'
        ? 'flex-end'
        : 'flex-start';
  const sectionJustify: ImageCompareContentStyle['sectionJustify'] =
    sectionAlignment === 'space-between'
      ? 'space-between'
      : mapPositionJustify(sectionPosition || 'center');

  const desktopWidth = sizeCss(widthMode, customWidth);
  const mobileWidthCss = sizeCss(mobileWidthMode, mobileCustomWidth);
  const fixedSection = Boolean(panelMinHeight);
  const needsFillHeight =
    fixedSection ||
    isSectionHorizontal ||
    heightMode === 'fill' ||
    groupPosition === 'top' ||
    groupPosition === 'bottom';
  const height =
    heightMode === 'fill' || (needsFillHeight && (heightMode === 'fit' || !heightMode))
      ? '100%'
      : heightMode === 'custom'
        ? `${clampPercent(customHeight)}%`
        : 'auto';

  const showBgImage = bgMedia === 'image' && Boolean(bgImageUrl.trim());
  const safeId = sectionId.replace(/[^a-z0-9_-]/gi, '-');
  const mobileClass = `codiic-ic-content-${safeId}`;
  const contentBackground = showBgImage
    ? 'transparent'
    : !backgroundColorRaw || backgroundColorRaw === 'default'
      ? 'transparent'
      : resolveThemePaletteColorSetting(
          config,
          backgroundColorRaw,
          0,
          sectionScheme.contentPanel
        );

  const shell: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    flexWrap: direction === 'horizontal' ? 'wrap' : undefined,
    alignItems: direction === 'horizontal' ? positionJustify : alignItems,
    justifyContent: direction === 'horizontal' ? alignItems : stackJustify,
    gap,
    width: widthMode === 'fill' || (fixedSection && isSectionHorizontal) ? '100%' : desktopWidth,
    maxWidth: '100%',
    height,
    boxSizing: 'border-box',
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    background: contentBackground,
    color: sectionScheme.color,
    textAlign,
    minHeight: fixedSection || needsFillHeight ? 0 : undefined,
    border: resolveImageCompareBorderCss(
      config,
      { borderStyle, borderThickness, borderOpacity, borderColor },
      sectionScheme.muted
    ),
    borderRadius: cornerRadius > 0 ? cornerRadius : undefined,
    overflow: 'hidden',
  };

  return {
    shell,
    mobileWidthCss,
    mobileClass,
    linkUrl,
    openInNewTab,
    bgImage: showBgImage ? bgImageUrl : null,
    showOverlay: backgroundOverlay && showBgImage,
    textAlign,
    alignItems,
    stackJustify,
    direction,
    gap,
    sectionAlignItems,
    sectionJustify,
  };
}

export function imageCompareContentMobileCss(mobileClass: string, mobileWidthCss: string): string {
  if (!mobileClass || mobileWidthCss === 'auto') return '';
  return atMobileBreakpoint(`.${mobileClass} { width: ${mobileWidthCss} !important; max-width: 100% !important; }`);
}
