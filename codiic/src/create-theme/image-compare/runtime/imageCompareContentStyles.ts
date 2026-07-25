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
  /** Main-axis placement for text + buttons stack (Position / Space between). */
  stackJustify: 'flex-start' | 'center' | 'flex-end' | 'space-between';
};

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
  const direction = readGroupString(config, settingsBase, 'direction', 'contentDirection', 'vertical');
  const groupAlignment = readGroupString(
    config,
    settingsBase,
    'layoutAlignment',
    'contentAlignment',
    'center'
  );
  /**
   * Section Layout → Alignment drives the content column.
   * Nested contentGroup.layoutAlignment is only a fallback (defaults often shadow the section otherwise).
   */
  const sectionIsAlignment =
    sectionAlignment === 'center' ||
    sectionAlignment === 'right' ||
    sectionAlignment === 'left' ||
    sectionAlignment === 'space-between';
  const isSpaceBetween = sectionIsAlignment
    ? sectionAlignment === 'space-between'
    : groupAlignment === 'space-between';
  const alignment =
    sectionAlignment === 'center' || sectionAlignment === 'right' || sectionAlignment === 'left'
      ? sectionAlignment
      : isSpaceBetween
        ? 'left'
        : groupAlignment === 'center' || groupAlignment === 'right' || groupAlignment === 'left'
          ? groupAlignment
          : 'left';
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

  const alignItems =
    alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';
  /** Section Position drives vertical placement; fall back to group position. */
  const effectivePosition =
    sectionPosition && sectionPosition !== 'center'
      ? sectionPosition
      : panelMinHeight
        ? sectionPosition || groupPosition
        : groupPosition !== 'center'
          ? groupPosition
          : sectionPosition || 'center';
  const positionJustify =
    effectivePosition === 'bottom'
      ? 'flex-end'
      : effectivePosition === 'center'
        ? 'center'
        : 'flex-start';
  const stackJustify: ImageCompareContentStyle['stackJustify'] = isSpaceBetween
    ? 'space-between'
    : positionJustify;
  const textAlign = (alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left') as
    | 'left'
    | 'center'
    | 'right';

  const desktopWidth = sizeCss(widthMode, customWidth);
  const mobileWidthCss = sizeCss(mobileWidthMode, mobileCustomWidth);
  const fixedSection = Boolean(panelMinHeight);
  const needsFillHeight =
    fixedSection ||
    isSectionHorizontal ||
    isSpaceBetween ||
    effectivePosition === 'top' ||
    effectivePosition === 'bottom';
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
    alignItems: direction === 'horizontal' ? positionJustify : alignItems,
    justifyContent: direction === 'horizontal' ? alignItems : stackJustify,
    gap,
    width: (fixedSection || isSpaceBetween) && isSectionHorizontal ? '100%' : desktopWidth,
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
  };
}

export function imageCompareContentMobileCss(mobileClass: string, mobileWidthCss: string): string {
  if (!mobileClass || mobileWidthCss === 'auto') return '';
  return atMobileBreakpoint(`.${mobileClass} { width: ${mobileWidthCss} !important; max-width: 100% !important; }`);
}
