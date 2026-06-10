import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { mobileMedia } from '../../runtime/shared/responsive';

export type LargeLogoBlockLayout = {
  logoFont: 'body' | 'subheading' | 'heading' | 'accent';
  sizeUnit: 'pixel' | 'percent';
  pixelHeight: number;
  percentWidth: number;
  customMobileSize: boolean;
  mobileSizeUnit: 'pixel' | 'percent';
  mobilePixelHeight: number;
  mobilePercentWidth: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export function readLargeLogoBlockLayout(
  config: Record<string, unknown> | null,
  settingsBase: string
): LargeLogoBlockLayout {
  const fontRaw = cfgString(config, `${settingsBase}.logoFont`, 'heading');
  const sizeRaw = cfgString(config, `${settingsBase}.sizeUnit`, 'percent');
  return {
    logoFont:
      fontRaw === 'body' || fontRaw === 'subheading' || fontRaw === 'accent' ? fontRaw : 'heading',
    sizeUnit: sizeRaw === 'pixel' ? 'pixel' : 'percent',
    pixelHeight: cfgNumber(config, `${settingsBase}.pixelHeight`, 120),
    percentWidth: cfgNumber(config, `${settingsBase}.percentWidth`, 100),
    customMobileSize: cfgBool(config, `${settingsBase}.customMobileSize`, false),
    mobileSizeUnit:
      cfgString(config, `${settingsBase}.mobileSizeUnit`) === 'pixel' ? 'pixel' : 'percent',
    mobilePixelHeight: cfgNumber(config, `${settingsBase}.mobilePixelHeight`, 80),
    mobilePercentWidth: cfgNumber(config, `${settingsBase}.mobilePercentWidth`, 100),
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
  };
}

export function largeLogoFontFamily(
  role: LargeLogoBlockLayout['logoFont'],
  fonts: { fontHeading: string; fontBody: string }
): string {
  if (role === 'body' || role === 'subheading') return fonts.fontBody;
  return fonts.fontHeading;
}

export function largeLogoFontStyle(role: LargeLogoBlockLayout['logoFont']): CSSProperties {
  if (role === 'accent') return { fontStyle: 'italic' };
  if (role === 'subheading') return { fontWeight: 600 };
  if (role === 'body') return { fontWeight: 400 };
  return { fontWeight: 800 };
}

export function largeLogoMarkStyle(
  layout: LargeLogoBlockLayout,
  fonts: { fontHeading: string; fontBody: string },
  color: string,
  textAlign: 'left' | 'center' | 'right'
): CSSProperties {
  const base: CSSProperties = {
    display: 'block',
    margin: 0,
    boxSizing: 'border-box',
    paddingTop: layout.paddingTop,
    paddingBottom: layout.paddingBottom,
    paddingLeft: layout.paddingLeft,
    paddingRight: layout.paddingRight,
    fontFamily: largeLogoFontFamily(layout.logoFont, fonts),
    color,
    textAlign,
    ...largeLogoFontStyle(layout.logoFont),
  };

  if (layout.sizeUnit === 'percent') {
    return {
      ...base,
      width: `${layout.percentWidth}%`,
      maxWidth: '100%',
      fontSize: 'clamp(4rem, 18vw, 11rem)',
      lineHeight: 0.95,
      letterSpacing: '-0.04em',
    };
  }

  return {
    ...base,
    width: 'auto',
    maxWidth: '100%',
    fontSize: `${layout.pixelHeight}px`,
    lineHeight: 1.05,
  };
}

export function largeLogoImageStyle(layout: LargeLogoBlockLayout): CSSProperties {
  return {
    display: 'block',
    width: layout.sizeUnit === 'percent' ? `${layout.percentWidth}%` : 'auto',
    maxWidth: '100%',
    maxHeight: layout.sizeUnit === 'pixel' ? layout.pixelHeight : 'min(42vh, 520px)',
    height: 'auto',
    objectFit: 'contain',
    margin: '0 auto',
    paddingTop: layout.paddingTop,
    paddingBottom: layout.paddingBottom,
    paddingLeft: layout.paddingLeft,
    paddingRight: layout.paddingRight,
    boxSizing: 'border-box',
  };
}

export function scopedLargeLogoBlockMobileCss(
  scopeClass: string,
  layout: LargeLogoBlockLayout
): string {
  if (!layout.customMobileSize) return '';
  const sel = `.${scopeClass} .ziplofy-large-logo-mark`;
  if (layout.mobileSizeUnit === 'pixel') {
    return mobileMedia(
      `${sel} { font-size: ${layout.mobilePixelHeight}px !important; width: auto !important; }`
    );
  }
  return mobileMedia(
    `${sel} { width: ${layout.mobilePercentWidth}% !important; font-size: clamp(2.75rem, 14vw, 6rem) !important; }`
  );
}
