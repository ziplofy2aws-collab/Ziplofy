import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { atMobileBreakpoint } from '../../runtime/shared/responsive';
import type { ImageCompareScheme } from './imageCompareStyles';

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
};

export function readImageCompareContentStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  sectionScheme: ImageCompareScheme,
  sectionId: string,
  panelMinHeight: number,
  isSectionHorizontal: boolean
): ImageCompareContentStyle {
  const direction = readGroupString(config, settingsBase, 'direction', 'contentDirection', 'vertical');
  const alignment = readGroupString(
    config,
    settingsBase,
    'layoutAlignment',
    'contentAlignment',
    'center'
  );
  const position = readGroupString(config, settingsBase, 'position', 'contentPosition', 'center');
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
  const borderStyle = readGroupString(config, settingsBase, 'borderStyle', 'contentBorderStyle', 'none');
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
  const justifyContent =
    position === 'bottom' ? 'flex-end' : position === 'center' ? 'center' : 'flex-start';
  const textAlign =
    alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left';

  const desktopWidth = sizeCss(widthMode, customWidth);
  const mobileWidthCss = sizeCss(mobileWidthMode, mobileCustomWidth);
  const height =
    heightMode === 'fill'
      ? '100%'
      : heightMode === 'custom'
        ? `${clampPercent(customHeight)}%`
        : 'auto';

  const showBgImage = bgMedia === 'image' && Boolean(bgImageUrl.trim());
  const safeId = sectionId.replace(/[^a-z0-9_-]/gi, '-');
  const mobileClass = `codiic-ic-content-${safeId}`;

  const shell: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    alignItems: direction === 'horizontal' ? justifyContent : alignItems,
    justifyContent: direction === 'horizontal' ? alignItems : justifyContent,
    gap,
    width: desktopWidth,
    height,
    boxSizing: 'border-box',
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    background: sectionScheme.contentPanel,
    color: sectionScheme.color,
    textAlign,
    minHeight: isSectionHorizontal ? panelMinHeight : undefined,
    border: borderStyle === 'solid' ? `1px solid ${sectionScheme.muted}33` : undefined,
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
  };
}

export function imageCompareContentMobileCss(mobileClass: string, mobileWidthCss: string): string {
  if (!mobileClass || mobileWidthCss === 'auto') return '';
  return atMobileBreakpoint(`.${mobileClass} { width: ${mobileWidthCss} !important; max-width: 100% !important; }`);
}
