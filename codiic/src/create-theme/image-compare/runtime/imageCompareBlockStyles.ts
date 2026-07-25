import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { atMobileBreakpoint } from '../../runtime/shared/responsive';
import {
  resolveThemeButtonVariantStyle,
  themeButtonInlineStyle,
} from '../../runtime/shared/themeButtonRuntime';
import {
  letterSpacingCss,
  lineHeightMultiplier,
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  resolveThemeTypographyStyle,
  themeFontsFromConfig,
} from '../../runtime/shared/themeTypographyRuntime';
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

function normalizeHeadingPresetKey(preset: string): string {
  if (!preset || preset === 'default') return 'heading-2';
  return preset;
}

function normalizeTextPresetKey(preset: string): string {
  if (!preset || preset === 'default' || preset === 'body') return 'paragraph';
  return preset;
}

function maxWidthPxFor(mode: string): number {
  if (mode === 'narrow') return 360;
  if (mode === 'wide') return 760;
  return 520;
}

export function readImageCompareHeadingStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  scheme: ImageCompareScheme,
  fontHeading: string
): CSSProperties {
  const widthMode = cfgString(config, `${settingsBase}.headingWidth`, 'fit');
  const maxWidthMode = cfgString(config, `${settingsBase}.headingMaxWidth`, 'normal');
  const preset = cfgString(config, `${settingsBase}.headingTypographyPreset`, 'default');
  const colorRaw = cfgString(config, `${settingsBase}.headingColor`, '');
  const backgroundEnabled = cfgBool(config, `${settingsBase}.headingBackgroundEnabled`, false);
  const backgroundColorRaw = cfgString(config, `${settingsBase}.headingBackgroundColor`, '#f3f4f6');
  const paddingTop = cfgNumber(config, `${settingsBase}.headingPaddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.headingPaddingBottom`, 0);
  const paddingLeft = cfgNumber(config, `${settingsBase}.headingPaddingLeft`, 0);
  const paddingRight = cfgNumber(config, `${settingsBase}.headingPaddingRight`, 0);

  const color =
    colorRaw === '' || colorRaw === 'default'
      ? scheme.color
      : resolveThemePaletteColorSetting(config, colorRaw, 1, scheme.color);
  const backgroundColor =
    !backgroundColorRaw || backgroundColorRaw === 'default'
      ? '#f3f4f6'
      : resolveThemePaletteColorSetting(config, backgroundColorRaw, 0, '#f3f4f6');

  const themeFonts = themeFontsFromConfig(config);
  const isCustom = preset === 'custom';
  const themeTypo = resolveThemeTypographyStyle(
    config,
    normalizeHeadingPresetKey(preset),
    themeFonts
  );

  const customFont = cfgString(config, `${settingsBase}.headingFont`, 'heading');
  const customSizeRaw = cfgString(config, `${settingsBase}.headingFontSize`, '32px');
  const customSizePx = (() => {
    if (!customSizeRaw || customSizeRaw === 'default') return themeTypo.fontSize;
    const n = parseFloat(customSizeRaw);
    return Number.isFinite(n) && n > 0 ? n : themeTypo.fontSize;
  })();
  const customWeightStyle = resolveThemeFontWeightAndStyle(customFont);
  const customWrap = cfgString(config, `${settingsBase}.headingWrap`, 'pretty');
  const customCase = cfgString(config, `${settingsBase}.headingTextCase`, 'default');
  const customLetterSpacing = cfgString(config, `${settingsBase}.headingLetterSpacing`, 'normal');
  const customLineHeight = cfgString(config, `${settingsBase}.headingLineHeight`, 'normal');
  const fontSizePx = isCustom ? customSizePx : themeTypo.fontSize;

  return {
    display: 'block',
    margin: 0,
    fontFamily: isCustom
      ? resolveThemeFontFamily(customFont, themeFonts)
      : themeTypo.fontFamily || fontHeading,
    fontSize: `${fontSizePx}px`,
    fontWeight: isCustom ? (customWeightStyle.fontWeight ?? 700) : themeTypo.fontWeight,
    fontStyle: isCustom ? customWeightStyle.fontStyle : themeTypo.fontStyle,
    lineHeight: isCustom
      ? customLineHeight === 'normal'
        ? 1.2
        : lineHeightMultiplier(customLineHeight)
      : themeTypo.lineHeight,
    letterSpacing: isCustom
      ? letterSpacingCss(customLetterSpacing)
      : themeTypo.letterSpacing,
    textTransform: isCustom
      ? customCase === 'uppercase'
        ? 'uppercase'
        : undefined
      : themeTypo.textTransform,
    textWrap: isCustom
      ? ((customWrap === 'nowrap'
          ? 'nowrap'
          : customWrap === 'balance'
            ? 'balance'
            : 'pretty') as CSSProperties['textWrap'])
      : undefined,
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: widthMode === 'fill' ? '100%' : maxWidthPxFor(maxWidthMode),
    alignSelf: widthMode === 'fill' ? 'stretch' : 'flex-start',
    color,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    background: backgroundEnabled ? backgroundColor : undefined,
    borderRadius: backgroundEnabled ? 8 : undefined,
    boxSizing: 'border-box',
  };
}

export function readImageCompareSubheadingStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  scheme: ImageCompareScheme,
  fontBody: string
): CSSProperties {
  const widthMode = cfgString(config, `${settingsBase}.subheadingWidth`, 'fit');
  const maxWidthMode = cfgString(config, `${settingsBase}.subheadingMaxWidth`, 'normal');
  const preset = cfgString(config, `${settingsBase}.subheadingTypographyPreset`, 'default');
  const colorRaw = cfgString(config, `${settingsBase}.subheadingColor`, '');
  const backgroundEnabled = cfgBool(config, `${settingsBase}.subheadingBackgroundEnabled`, false);
  const backgroundColorRaw = cfgString(
    config,
    `${settingsBase}.subheadingBackgroundColor`,
    '#f3f4f6'
  );
  const paddingTop = cfgNumber(config, `${settingsBase}.subheadingPaddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.subheadingPaddingBottom`, 0);
  const paddingLeft = cfgNumber(config, `${settingsBase}.subheadingPaddingLeft`, 0);
  const paddingRight = cfgNumber(config, `${settingsBase}.subheadingPaddingRight`, 0);

  const color =
    colorRaw === '' || colorRaw === 'default'
      ? scheme.muted
      : resolveThemePaletteColorSetting(config, colorRaw, 1, scheme.muted);
  const backgroundColor =
    !backgroundColorRaw || backgroundColorRaw === 'default'
      ? '#f3f4f6'
      : resolveThemePaletteColorSetting(config, backgroundColorRaw, 0, '#f3f4f6');

  const themeFonts = themeFontsFromConfig(config);
  const isCustom = preset === 'custom';
  const themeTypo = resolveThemeTypographyStyle(
    config,
    normalizeTextPresetKey(preset),
    themeFonts
  );

  const customFont = cfgString(config, `${settingsBase}.subheadingFont`, 'body');
  const customSizeRaw = cfgString(config, `${settingsBase}.subheadingFontSize`, '16px');
  const customSizePx = (() => {
    if (!customSizeRaw || customSizeRaw === 'default') return themeTypo.fontSize;
    const n = parseFloat(customSizeRaw);
    return Number.isFinite(n) && n > 0 ? n : themeTypo.fontSize;
  })();
  const customWeightStyle = resolveThemeFontWeightAndStyle(customFont);
  const customWrap = cfgString(config, `${settingsBase}.subheadingWrap`, 'pretty');
  const customCase = cfgString(config, `${settingsBase}.subheadingTextCase`, 'default');
  const customLetterSpacing = cfgString(
    config,
    `${settingsBase}.subheadingLetterSpacing`,
    'normal'
  );
  const customLineHeight = cfgString(config, `${settingsBase}.subheadingLineHeight`, 'normal');
  const fontSizePx = isCustom ? customSizePx : themeTypo.fontSize;

  return {
    display: 'block',
    margin: 0,
    fontFamily: isCustom
      ? resolveThemeFontFamily(customFont, themeFonts)
      : themeTypo.fontFamily || fontBody,
    fontSize: `${fontSizePx}px`,
    fontWeight: isCustom ? (customWeightStyle.fontWeight ?? 400) : themeTypo.fontWeight,
    fontStyle: isCustom ? customWeightStyle.fontStyle : themeTypo.fontStyle,
    lineHeight: isCustom
      ? customLineHeight === 'normal'
        ? 1.55
        : lineHeightMultiplier(customLineHeight)
      : themeTypo.lineHeight,
    letterSpacing: isCustom
      ? letterSpacingCss(customLetterSpacing)
      : themeTypo.letterSpacing,
    textTransform: isCustom
      ? customCase === 'uppercase'
        ? 'uppercase'
        : undefined
      : themeTypo.textTransform,
    textWrap: isCustom
      ? ((customWrap === 'nowrap'
          ? 'nowrap'
          : customWrap === 'balance'
            ? 'balance'
            : 'pretty') as CSSProperties['textWrap'])
      : undefined,
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: widthMode === 'fill' ? '100%' : maxWidthPxFor(maxWidthMode),
    alignSelf: widthMode === 'fill' ? 'stretch' : 'flex-start',
    color,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    background: backgroundEnabled ? backgroundColor : undefined,
    borderRadius: backgroundEnabled ? 8 : undefined,
    boxSizing: 'border-box',
  };
}

export type ImageCompareButtonStyle = {
  style: CSSProperties;
  openInNewTab: boolean;
  mobileClass: string;
  mobileCss: string;
};

export function readImageCompareButtonStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  scheme: ImageCompareScheme,
  sectionId: string,
  prefix: 'button1' | 'button2',
  fontBody: string
): ImageCompareButtonStyle {
  const openInNewTab = cfgBool(config, `${settingsBase}.${prefix}OpenInNewTab`, false);
  const buttonStyleMode = cfgString(config, `${settingsBase}.${prefix}Style`, 'secondary');
  const buttonCustomBackground = cfgString(
    config,
    `${settingsBase}.${prefix}CustomBackground`,
    '#111827'
  );
  const buttonCustomText = cfgString(config, `${settingsBase}.${prefix}CustomText`, '#ffffff');
  const linkTextColorRaw = cfgString(config, `${settingsBase}.${prefix}LinkTextColor`, '');
  const desktopWidthMode = cfgString(config, `${settingsBase}.${prefix}DesktopWidth`, 'fit');
  const mobileWidthMode = cfgString(config, `${settingsBase}.${prefix}MobileWidth`, 'fit');
  const desktopCustom = cfgNumber(config, `${settingsBase}.${prefix}DesktopCustomWidth`, 100);
  const mobileCustom = cfgNumber(config, `${settingsBase}.${prefix}MobileCustomWidth`, 100);

  const desktopWidth = sizeCss(desktopWidthMode, desktopCustom);
  const mobileWidth = sizeCss(mobileWidthMode, mobileCustom);
  const safeId = sectionId.replace(/[^a-z0-9_-]/gi, '-');
  const mobileClass = `codiic-ic-btn-${prefix}-${safeId}`;

  const themeVariant =
    buttonStyleMode === 'secondary'
      ? resolveThemeButtonVariantStyle(config, 'secondary')
      : resolveThemeButtonVariantStyle(config, 'primary');
  const themeButtonStyle = themeButtonInlineStyle(themeVariant);

  const appearance: CSSProperties =
    buttonStyleMode === 'link'
      ? {
          background: 'transparent',
          color:
            linkTextColorRaw === '' || linkTextColorRaw === 'default'
              ? scheme.color
              : resolveThemePaletteColorSetting(config, linkTextColorRaw, 1, scheme.color),
          border: 'none',
          borderRadius: 0,
          fontFamily: fontBody,
          fontWeight: 600,
          textDecoration: 'underline',
          textUnderlineOffset: 4,
          padding: '4px 0',
        }
      : buttonStyleMode === 'custom'
        ? {
            background: buttonCustomBackground,
            color: buttonCustomText,
            border: 'none',
            borderRadius: themeButtonStyle.borderRadius,
            fontFamily: themeButtonStyle.fontFamily,
            fontWeight: themeButtonStyle.fontWeight,
            textTransform: themeButtonStyle.textTransform,
            padding: '10px 22px',
            textDecoration: 'none',
          }
        : {
            ...themeButtonStyle,
            padding: '10px 22px',
            textDecoration: 'none',
          };

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginTop: 0,
    boxSizing: 'border-box',
    width: desktopWidth === 'auto' ? 'fit-content' : desktopWidth,
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    ...appearance,
  };

  const mobileCss =
    desktopWidth !== mobileWidth
      ? atMobileBreakpoint(
          `.${mobileClass} { width: ${mobileWidth === 'auto' ? 'fit-content' : mobileWidth} !important; max-width: 100% !important; }`
        )
      : '';

  return { style, openInNewTab, mobileClass, mobileCss };
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

function readNestedString(
  config: Record<string, unknown> | null,
  base: string,
  key: string,
  fallback: string
): string {
  const path = `${base}.${key}`;
  if (hasNested(config, path)) return cfgString(config, path, fallback);
  return fallback;
}

function readNestedNumber(
  config: Record<string, unknown> | null,
  base: string,
  key: string,
  fallback: number
): number {
  const path = `${base}.${key}`;
  if (hasNested(config, path)) return cfgNumber(config, path, fallback);
  return fallback;
}

function readNestedBool(
  config: Record<string, unknown> | null,
  base: string,
  key: string,
  fallback: boolean
): boolean {
  const path = `${base}.${key}`;
  if (hasNested(config, path)) return cfgBool(config, path, fallback);
  return fallback;
}

export type ImageCompareNestedGroupStyle = {
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

/** Shared reader for textGroup / buttonsGroup nested shells. */
export function readImageCompareNestedGroupStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  groupKey: 'textGroup' | 'buttonsGroup',
  scheme: ImageCompareScheme,
  sectionId: string,
  defaults: {
    direction: string;
    layoutAlignment: string;
    layoutGap: number;
  }
): ImageCompareNestedGroupStyle {
  const base = `${settingsBase}.${groupKey}`;
  const direction = readNestedString(config, base, 'direction', defaults.direction);
  const alignmentRaw = readNestedString(
    config,
    base,
    'layoutAlignment',
    defaults.layoutAlignment
  );
  const position = readNestedString(config, base, 'position', 'center');
  const gap = readNestedNumber(config, base, 'layoutGap', defaults.layoutGap);
  const widthMode = readNestedString(config, base, 'width', 'fill');
  const mobileWidthMode = readNestedString(config, base, 'mobileWidth', 'fill');
  const heightMode = readNestedString(config, base, 'height', 'fit');
  const customWidth = readNestedNumber(config, base, 'customWidth', 100);
  const mobileCustomWidth = readNestedNumber(config, base, 'mobileCustomWidth', 100);
  const customHeight = readNestedNumber(config, base, 'customHeight', 100);
  const bgMedia = readNestedString(config, base, 'backgroundMedia', 'none');
  const bgImageUrl = readNestedString(config, base, 'backgroundImageUrl', '');
  const backgroundColorRaw = readNestedString(config, base, 'backgroundColor', 'default');
  const borderStyle = readNestedString(config, base, 'borderStyle', 'none');
  const borderThickness = readNestedNumber(config, base, 'borderThickness', 1);
  const borderOpacity = readNestedNumber(config, base, 'borderOpacity', 100);
  const borderColor = readNestedString(config, base, 'borderColor', 'default');
  const cornerRadius = readNestedNumber(config, base, 'cornerRadius', 0);
  const backgroundOverlay = readNestedBool(config, base, 'backgroundOverlay', false);
  const paddingTop = readNestedNumber(config, base, 'paddingTop', 0);
  const paddingBottom = readNestedNumber(config, base, 'paddingBottom', 0);
  const paddingLeft = readNestedNumber(config, base, 'paddingLeft', 0);
  const paddingRight = readNestedNumber(config, base, 'paddingRight', 0);
  const linkUrl = readNestedString(config, base, 'linkUrl', '');
  const openInNewTab = readNestedBool(config, base, 'openLinkInNewTab', false);

  const alignment =
    alignmentRaw === 'center' || alignmentRaw === 'flex-center'
      ? 'center'
      : alignmentRaw === 'right' || alignmentRaw === 'flex-end'
        ? 'right'
        : alignmentRaw === 'left' || alignmentRaw === 'flex-start'
          ? 'left'
          : 'left';
  const alignItems =
    alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';
  const justifyContent =
    position === 'bottom' ? 'flex-end' : position === 'center' ? 'center' : 'flex-start';
  const textAlign = alignment as 'left' | 'center' | 'right';

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
  const mobileClass = `codiic-ic-${groupKey}-${safeId}`;
  const background = showBgImage
    ? 'transparent'
    : !backgroundColorRaw || backgroundColorRaw === 'default'
      ? 'transparent'
      : resolveThemePaletteColorSetting(config, backgroundColorRaw, 0, scheme.contentPanel);

  const shell: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    alignItems: direction === 'horizontal' ? justifyContent : alignItems,
    justifyContent: direction === 'horizontal' ? alignItems : justifyContent,
    flexWrap: direction === 'horizontal' ? 'wrap' : undefined,
    gap,
    width: desktopWidth,
    height,
    boxSizing: 'border-box',
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    background,
    color: scheme.color,
    textAlign,
    border: resolveImageCompareBorderCss(
      config,
      { borderStyle, borderThickness, borderOpacity, borderColor },
      scheme.muted
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
  };
}

export function imageCompareNestedGroupMobileCss(
  mobileClass: string,
  mobileWidthCss: string
): string {
  if (!mobileClass || mobileWidthCss === 'auto') return '';
  return atMobileBreakpoint(
    `.${mobileClass} { width: ${mobileWidthCss} !important; max-width: 100% !important; }`
  );
}
