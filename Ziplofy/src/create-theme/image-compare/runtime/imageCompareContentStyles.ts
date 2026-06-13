import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
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
  const direction = cfgString(config, `${settingsBase}.contentDirection`, 'vertical');
  const alignment = cfgString(config, `${settingsBase}.contentAlignment`, 'center');
  const position = cfgString(config, `${settingsBase}.contentPosition`, 'center');
  const gap = cfgNumber(config, `${settingsBase}.contentGap`, 30);

  const widthMode = cfgString(config, `${settingsBase}.contentWidth`, 'fit');
  const mobileWidthMode = cfgString(config, `${settingsBase}.contentMobileWidth`, 'fill');
  const heightMode = cfgString(config, `${settingsBase}.contentHeight`, 'fit');
  const customWidth = cfgNumber(config, `${settingsBase}.contentCustomWidth`, 100);
  const mobileCustomWidth = cfgNumber(config, `${settingsBase}.contentMobileCustomWidth`, 100);
  const customHeight = cfgNumber(config, `${settingsBase}.contentCustomHeight`, 100);

  const inheritColorScheme = cfgBool(config, `${settingsBase}.contentInheritColorScheme`, true);
  const bgMedia = cfgString(config, `${settingsBase}.contentBackgroundMedia`, 'none');
  const bgImageUrl = cfgString(config, `${settingsBase}.contentBackgroundImageUrl`, '');
  const borderStyle = cfgString(config, `${settingsBase}.contentBorderStyle`, 'none');
  const cornerRadius = cfgNumber(config, `${settingsBase}.contentCornerRadius`, 0);
  const backgroundOverlay = cfgBool(config, `${settingsBase}.contentBackgroundOverlay`, false);
  const paddingTop = cfgNumber(config, `${settingsBase}.contentPaddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.contentPaddingBottom`, 0);
  const paddingLeft = cfgNumber(config, `${settingsBase}.contentPaddingLeft`, 0);
  const paddingRight = cfgNumber(config, `${settingsBase}.contentPaddingRight`, 0);
  const linkUrl = cfgString(config, `${settingsBase}.contentLinkUrl`, '');
  const openInNewTab = cfgBool(config, `${settingsBase}.contentOpenInNewTab`, false);

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
  const mobileClass = `ziplofy-ic-content-${safeId}`;

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
    background: inheritColorScheme ? sectionScheme.contentPanel : '#ffffff',
    color: inheritColorScheme ? sectionScheme.color : '#111827',
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
  return `@media (max-width: 749px) { .${mobileClass} { width: ${mobileWidthCss} !important; max-width: 100% !important; } }`;
}
