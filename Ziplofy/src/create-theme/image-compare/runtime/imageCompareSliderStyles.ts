import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import type { ImageCompareScheme } from './imageCompareStyles';

function clampPercent(value: number, fallback = 100): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(1, value));
}

function widthCss(mode: string, percent: number): string {
  if (mode === 'fill') return '100%';
  if (mode === 'custom') return `${clampPercent(percent)}%`;
  return 'auto';
}

const ASPECT_RATIOS: Record<string, string | undefined> = {
  landscape: '16 / 9',
  portrait: '3 / 4',
  square: '1 / 1',
  adapt: undefined,
};

export type ImageCompareSliderStyle = {
  beforeUrl: string;
  afterUrl: string;
  direction: 'horizontal' | 'vertical';
  textOnImages: boolean;
  aspectRatio: string | undefined;
  desktopWidth: string;
  mobileWidthCss: string;
  inheritColorScheme: boolean;
  panelBackground: string;
  borderStyle: string;
  borderColor: string;
  cornerRadius: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  wrap: CSSProperties;
  mobileClass: string;
};

export function readImageCompareSliderStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  sectionScheme: ImageCompareScheme,
  sectionId: string
): ImageCompareSliderStyle {
  const beforeUrl = cfgString(config, `${settingsBase}.imageBeforeUrl`, '');
  const afterUrl = cfgString(config, `${settingsBase}.imageAfterUrl`, '');
  const directionRaw = cfgString(config, `${settingsBase}.sliderDirection`, 'horizontal');
  const direction: 'horizontal' | 'vertical' =
    directionRaw === 'vertical' ? 'vertical' : 'horizontal';
  const textOnImages = cfgBool(config, `${settingsBase}.sliderTextOnImages`, false);

  const aspectKey = cfgString(config, `${settingsBase}.sliderAspectRatio`, 'landscape');
  const aspectRatio = ASPECT_RATIOS[aspectKey];

  const desktopWidthMode = cfgString(config, `${settingsBase}.sliderDesktopWidth`, 'custom');
  const desktopCustom = cfgNumber(config, `${settingsBase}.sliderDesktopCustomWidth`, 65);
  const mobileWidthMode = cfgString(config, `${settingsBase}.sliderMobileWidth`, 'fill');
  const mobileCustom = cfgNumber(config, `${settingsBase}.sliderMobileCustomWidth`, 100);

  const inheritColorScheme = cfgBool(config, `${settingsBase}.sliderInheritColorScheme`, false);
  const borderStyle = cfgString(config, `${settingsBase}.sliderBorderStyle`, 'none');
  const cornerRadius = cfgNumber(config, `${settingsBase}.sliderCornerRadius`, 0);
  const paddingTop = cfgNumber(config, `${settingsBase}.sliderPaddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.sliderPaddingBottom`, 0);
  const paddingLeft = cfgNumber(config, `${settingsBase}.sliderPaddingLeft`, 0);
  const paddingRight = cfgNumber(config, `${settingsBase}.sliderPaddingRight`, 0);

  const panelBackground = inheritColorScheme ? sectionScheme.comparePanel : '#f4f4f4';
  const desktopWidth = widthCss(desktopWidthMode, desktopCustom);
  const mobileWidthCss = widthCss(mobileWidthMode, mobileCustom);
  const safeId = sectionId.replace(/[^a-z0-9_-]/gi, '-');
  const mobileClass = `ziplofy-ic-slider-${safeId}`;

  const wrap: CSSProperties = {
    position: 'relative',
    width: desktopWidth,
    maxWidth: desktopWidthMode === 'fit' ? 520 : desktopWidthMode === 'custom' ? '100%' : '100%',
    margin: desktopWidthMode === 'fit' ? '0 auto' : undefined,
    aspectRatio,
    minHeight: aspectRatio ? undefined : 280,
    borderRadius: cornerRadius > 0 ? cornerRadius : 4,
    overflow: 'hidden',
    background: panelBackground,
    border: borderStyle === 'solid' ? `1px solid ${sectionScheme.muted}33` : undefined,
    boxSizing: 'border-box',
    touchAction: 'none',
    userSelect: 'none',
  };

  return {
    beforeUrl,
    afterUrl,
    direction,
    textOnImages,
    aspectRatio,
    desktopWidth,
    mobileWidthCss,
    inheritColorScheme,
    panelBackground,
    borderStyle,
    borderColor: `${sectionScheme.muted}33`,
    cornerRadius,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    wrap,
    mobileClass,
  };
}

export function imageCompareSliderMobileCss(mobileClass: string, mobileWidthCss: string): string {
  if (!mobileClass || mobileWidthCss === 'auto') return '';
  return `@media (max-width: 749px) { .${mobileClass} { width: ${mobileWidthCss} !important; max-width: 100% !important; } }`;
}
