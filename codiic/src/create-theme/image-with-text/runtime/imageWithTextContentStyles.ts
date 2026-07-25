import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { atMobileBreakpoint } from '../../runtime/shared/responsive';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import {
  resolveImageWithTextBorderCss,
  type ImageWithTextScheme,
} from './imageWithTextStyles';

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
  fallback: string
): string {
  const nestedPath = `${groupBase(settingsBase)}.${key}`;
  if (hasNested(config, nestedPath)) {
    return cfgString(config, nestedPath, fallback);
  }
  return fallback;
}

function readGroupNumber(
  config: Record<string, unknown> | null,
  settingsBase: string,
  key: string,
  fallback: number
): number {
  const nestedPath = `${groupBase(settingsBase)}.${key}`;
  if (hasNested(config, nestedPath)) {
    return cfgNumber(config, nestedPath, fallback);
  }
  return fallback;
}

function readGroupBool(
  config: Record<string, unknown> | null,
  settingsBase: string,
  key: string,
  fallback: boolean
): boolean {
  const nestedPath = `${groupBase(settingsBase)}.${key}`;
  if (hasNested(config, nestedPath)) {
    return cfgBool(config, nestedPath, fallback);
  }
  return fallback;
}

export type ImageWithTextContentStyle = {
  shell: CSSProperties;
  mobileWidthCss: string;
  mobileClass: string;
  linkUrl: string;
  openInNewTab: boolean;
  bgImage: string | null;
  showOverlay: boolean;
  textAlign: 'left' | 'center' | 'right';
  alignItems: 'flex-start' | 'center' | 'flex-end';
};

export function readImageWithTextContentStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  sectionScheme: ImageWithTextScheme,
  sectionId: string,
  sectionHeightPx: number | undefined,
  isSectionHorizontal: boolean,
  sectionPosition: string,
  sectionAlignment: string
): ImageWithTextContentStyle {
  const direction = readGroupString(config, settingsBase, 'direction', 'vertical');
  const groupAlignment = readGroupString(config, settingsBase, 'layoutAlignment', 'left');
  /**
   * Section Layout → Alignment drives content text alignment.
   * Group Alignment writes the same section path so both controls stay in sync.
   */
  const alignment =
    sectionAlignment === 'center' || sectionAlignment === 'right' || sectionAlignment === 'left'
      ? sectionAlignment
      : groupAlignment === 'center' || groupAlignment === 'right' || groupAlignment === 'left'
        ? groupAlignment
        : 'left';
  const groupPosition = readGroupString(config, settingsBase, 'position', 'center');
  const gap = readGroupNumber(config, settingsBase, 'layoutGap', 12);

  const widthMode = readGroupString(config, settingsBase, 'width', 'custom');
  const mobileWidthMode = readGroupString(config, settingsBase, 'mobileWidth', 'fill');
  const heightMode = readGroupString(config, settingsBase, 'height', 'fit');
  const customWidth = readGroupNumber(config, settingsBase, 'customWidth', 100);
  const mobileCustomWidth = readGroupNumber(config, settingsBase, 'mobileCustomWidth', 100);
  const customHeight = readGroupNumber(config, settingsBase, 'customHeight', 100);

  const bgMedia = readGroupString(config, settingsBase, 'backgroundMedia', 'none');
  const bgImageUrl = readGroupString(config, settingsBase, 'backgroundImageUrl', '');
  const backgroundColorRaw = readGroupString(config, settingsBase, 'backgroundColor', 'default');
  const borderStyle = readGroupString(config, settingsBase, 'borderStyle', 'none');
  const borderThickness = readGroupNumber(config, settingsBase, 'borderThickness', 1);
  const borderOpacity = readGroupNumber(config, settingsBase, 'borderOpacity', 100);
  const borderColor = readGroupString(config, settingsBase, 'borderColor', 'default');
  const cornerRadius = readGroupNumber(config, settingsBase, 'cornerRadius', 0);
  const backgroundOverlay = readGroupBool(config, settingsBase, 'backgroundOverlay', false);
  const paddingTop = readGroupNumber(config, settingsBase, 'paddingTop', 0);
  const paddingBottom = readGroupNumber(config, settingsBase, 'paddingBottom', 0);
  const paddingLeft = readGroupNumber(config, settingsBase, 'paddingLeft', 0);
  const paddingRight = readGroupNumber(config, settingsBase, 'paddingRight', 0);
  const linkUrl = readGroupString(config, settingsBase, 'linkUrl', '');
  const openInNewTab = readGroupBool(config, settingsBase, 'openLinkInNewTab', false);

  const alignItems =
    alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';
  /** Section Position drives vertical placement; fall back to group position. */
  const effectivePosition =
    sectionPosition && sectionPosition !== 'center'
      ? sectionPosition
      : sectionHeightPx
        ? sectionPosition || groupPosition
        : groupPosition !== 'center'
          ? groupPosition
          : sectionPosition || 'center';
  const justifyContent =
    effectivePosition === 'bottom'
      ? 'flex-end'
      : effectivePosition === 'center'
        ? 'center'
        : 'flex-start';
  const textAlign = (alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left') as
    | 'left'
    | 'center'
    | 'right';

  const desktopWidth = sizeCss(widthMode, customWidth);
  const mobileWidthCss = sizeCss(mobileWidthMode, mobileCustomWidth);
  const fixedSection = Boolean(sectionHeightPx);
  const height =
    heightMode === 'fill' || (fixedSection && heightMode === 'fit')
      ? '100%'
      : heightMode === 'custom'
        ? `${clampPercent(customHeight)}%`
        : 'auto';

  const showBgImage = bgMedia === 'image' && Boolean(bgImageUrl.trim());
  const safeId = sectionId.replace(/[^a-z0-9_-]/gi, '-');
  const mobileClass = `codiic-iwt-content-${safeId}`;
  // Color only when there is no group background image (image must not be tinted by color).
  const contentBackground = showBgImage
    ? 'transparent'
    : !backgroundColorRaw || backgroundColorRaw === 'default'
      ? 'transparent'
      : resolveThemePaletteColorSetting(config, backgroundColorRaw, 0, sectionScheme.contentPanel);
  const border = resolveImageWithTextBorderCss(
    config,
    {
      borderStyle,
      borderThickness,
      borderOpacity,
      borderColor,
    },
    sectionScheme.muted
  );

  const shell: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    alignItems: direction === 'horizontal' ? justifyContent : alignItems,
    justifyContent: direction === 'horizontal' ? alignItems : justifyContent,
    gap,
    width: fixedSection && isSectionHorizontal ? '100%' : desktopWidth,
    height,
    boxSizing: 'border-box',
    paddingTop: paddingTop || 48,
    paddingBottom: paddingBottom || 48,
    paddingLeft: paddingLeft || 56,
    paddingRight: paddingRight || 56,
    background: contentBackground,
    color: sectionScheme.color,
    textAlign,
    minHeight: fixedSection ? 0 : undefined,
    alignSelf: 'stretch',
    border,
    borderRadius: cornerRadius > 0 ? cornerRadius : undefined,
    overflow: fixedSection ? 'auto' : 'hidden',
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
  };
}

export function imageWithTextContentMobileCss(mobileClass: string, mobileWidthCss: string): string {
  if (!mobileClass || mobileWidthCss === 'auto') return '';
  return atMobileBreakpoint(
    `.${mobileClass} { width: ${mobileWidthCss} !important; max-width: 100% !important; }`
  );
}
