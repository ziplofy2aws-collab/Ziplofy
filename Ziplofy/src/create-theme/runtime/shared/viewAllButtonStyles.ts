import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from './config';
import {
  isThemePaletteColorSetting,
  resolveThemePaletteColorSetting,
} from '../../settings/theme-color-palette.settings';
import {
  resolveThemeButtonVariantStyle,
  themeButtonInlineStyle,
} from './themeButtonRuntime';

export type ViewAllButtonStyle = {
  widthMode: 'fit' | 'custom';
  width: string;
  mobileWidthMode: 'fit' | 'custom';
  mobileWidth: string;
  display: CSSProperties['display'];
  padding: string;
  borderRadius: number;
  fontSize: number;
  fontWeight: number;
  background: string;
  color: string;
  border: string;
  textDecoration: string;
  whiteSpace: CSSProperties['whiteSpace'];
  openInNewTab: boolean;
};

function clampPercent(value: number, fallback = 100): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(1, value));
}

function buttonWidthCss(mode: string, percent: number): string {
  if (mode === 'custom') return `${clampPercent(percent)}%`;
  return 'fit-content';
}

function resolveViewAllColor(
  config: Record<string, unknown> | null,
  settingsBase: string,
  key: string,
  paletteIndex: number,
  fallback: string,
  colors: { primary: string; background: string; text: string }
): string {
  const raw = cfgString(config, `${settingsBase}.${key}`, `palette:${paletteIndex}`);
  if (raw === 'default' || !raw.trim()) {
    return paletteIndex === 0 ? colors.text : colors.background;
  }
  if (isThemePaletteColorSetting(raw) || raw.startsWith('#')) {
    return resolveThemePaletteColorSetting(config, raw, paletteIndex, fallback);
  }
  return fallback;
}

export function readViewAllButtonStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  colors: { primary: string; background: string; text: string; line: string }
): ViewAllButtonStyle {
  const styleKey = cfgString(config, `${settingsBase}.viewAllStyle`, 'link');
  const desktopMode = cfgString(config, `${settingsBase}.viewAllDesktopWidth`, 'fit');
  const mobileMode = cfgString(config, `${settingsBase}.viewAllMobileWidth`, 'fit');
  const desktopPercent = cfgNumber(config, `${settingsBase}.viewAllDesktopCustomWidth`, 100);
  const mobilePercent = cfgNumber(config, `${settingsBase}.viewAllMobileCustomWidth`, 100);
  const widthMode = desktopMode === 'custom' ? 'custom' : 'fit';
  const mobileWidthMode = mobileMode === 'custom' ? 'custom' : 'fit';
  const width = buttonWidthCss(desktopMode, desktopPercent);
  const mobileWidth = buttonWidthCss(mobileMode, mobilePercent);
  const openInNewTab = cfgBool(config, `${settingsBase}.viewAllOpenInNewTab`, false);

  if (styleKey === 'link') {
    const color = resolveViewAllColor(
      config,
      settingsBase,
      'viewAllLinkTextColor',
      2,
      colors.primary,
      colors
    );

    return {
      widthMode,
      width,
      mobileWidthMode,
      mobileWidth,
      display: 'inline-block',
      padding: 0,
      borderRadius: 0,
      fontSize: 14,
      fontWeight: 600,
      background: 'transparent',
      color,
      border: 'none',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      openInNewTab,
    };
  }

  if (styleKey === 'custom') {
    const background = resolveViewAllColor(
      config,
      settingsBase,
      'viewAllCustomBackgroundColor',
      0,
      '#111827',
      colors
    );
    const color = resolveViewAllColor(
      config,
      settingsBase,
      'viewAllCustomTextColor',
      1,
      '#ffffff',
      colors
    );
    const borderColor = resolveViewAllColor(
      config,
      settingsBase,
      'viewAllCustomBorderColor',
      1,
      '#ffffff',
      colors
    );

    return {
      widthMode,
      width,
      mobileWidthMode,
      mobileWidth,
      display: 'inline-block',
      padding: '10px 20px',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600,
      background,
      color,
      border: `1px solid ${borderColor}`,
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      openInNewTab,
    };
  }

  const variant = styleKey === 'primary' ? 'primary' : 'secondary';
  const themeButton = resolveThemeButtonVariantStyle(config, variant);
  const inline = themeButtonInlineStyle(themeButton);
  const isPrimary = variant === 'primary';

  return {
    widthMode,
    width,
    mobileWidthMode,
    mobileWidth,
    display: 'inline-block',
    padding: isPrimary ? '10px 20px' : '10px 18px',
    borderRadius: inline.borderRadius ?? 8,
    fontSize: 14,
    fontWeight: typeof inline.fontWeight === 'number' ? inline.fontWeight : 600,
    background: String(inline.background ?? (isPrimary ? colors.primary : 'transparent')),
    color: String(inline.color ?? (isPrimary ? colors.background : colors.text)),
    border: String(inline.border ?? (isPrimary ? 'none' : `1px solid ${colors.line}`)),
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    openInNewTab,
  };
}

export function viewAllButtonWrapperCss(
  style: Pick<ViewAllButtonStyle, 'widthMode' | 'width'>
): CSSProperties {
  return {
    flex: '0 0 auto',
    ...(style.widthMode === 'custom' ? { width: style.width, maxWidth: '100%' } : {}),
  };
}

export function viewAllButtonAnchorCss(
  style: Pick<
    ViewAllButtonStyle,
    | 'widthMode'
    | 'width'
    | 'display'
    | 'padding'
    | 'borderRadius'
    | 'fontSize'
    | 'fontWeight'
    | 'background'
    | 'color'
    | 'border'
    | 'textDecoration'
    | 'whiteSpace'
  >
): CSSProperties {
  const isFit = style.widthMode === 'fit';
  return {
    display: isFit ? 'inline-block' : 'block',
    width: isFit ? 'fit-content' : '100%',
    maxWidth: '100%',
    padding: style.padding,
    borderRadius: style.borderRadius,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    background: style.background,
    color: style.color,
    border: style.border,
    textDecoration: style.textDecoration,
    whiteSpace: style.whiteSpace,
    boxSizing: 'border-box',
    textAlign: 'center',
    cursor: 'pointer',
  };
}
