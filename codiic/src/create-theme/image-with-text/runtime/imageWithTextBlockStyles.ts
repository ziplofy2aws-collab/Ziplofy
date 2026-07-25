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

function normalizeHeadingPresetKey(preset: string): string {
  if (!preset || preset === 'default') return 'heading-3';
  return preset;
}

function normalizeTextPresetKey(preset: string): string {
  if (!preset || preset === 'default' || preset === 'body') return 'paragraph';
  return preset;
}

const ASPECT_RATIO: Record<string, string | undefined> = {
  adapt: undefined,
  auto: undefined,
  portrait: '3 / 4',
  square: '1 / 1',
  landscape: '4 / 3',
};

export type ImageWithTextImageStyle = {
  /** Grid-cell / column wrapper — owns desktop width so Size controls are visible. */
  column: CSSProperties;
  panel: CSSProperties;
  /** Aspect / crop frame around the image or placeholder. */
  media: CSSProperties;
  image: CSSProperties;
  /** Wrapper for placeholder art so it fills the aspect frame. */
  placeholder: CSSProperties;
  linkUrl: string;
  mobileClass: string;
  mobileWidthCss: string;
};

export function readImageWithTextImageStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  scheme: ImageWithTextScheme,
  sectionId: string,
  sectionHeightPx: number | undefined,
  isHorizontal: boolean
): ImageWithTextImageStyle {
  const linkUrl = cfgString(config, `${settingsBase}.imageLinkUrl`, '');
  const aspectRaw = cfgString(config, `${settingsBase}.imageAspectRatio`, 'square');
  const aspect = aspectRaw === 'auto' ? 'adapt' : aspectRaw;
  const desktopWidth = cfgString(config, `${settingsBase}.imageDesktopWidth`, 'fill');
  const desktopCustom = cfgNumber(config, `${settingsBase}.imageDesktopCustomWidth`, 100);
  const mobileWidth = cfgString(config, `${settingsBase}.imageMobileWidth`, 'fill');
  const mobileCustom = cfgNumber(config, `${settingsBase}.imageMobileCustomWidth`, 100);
  const borderStyle = cfgString(config, `${settingsBase}.imageBorderStyle`, 'none');
  const borderThickness = cfgNumber(config, `${settingsBase}.imageBorderThickness`, 1);
  const borderOpacity = cfgNumber(config, `${settingsBase}.imageBorderOpacity`, 100);
  const borderColor = cfgString(config, `${settingsBase}.imageBorderColor`, 'default');
  const cornerRadius = cfgNumber(config, `${settingsBase}.imageCornerRadius`, 0);
  const paddingTop = cfgNumber(config, `${settingsBase}.imagePaddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.imagePaddingBottom`, 0);
  const paddingLeft = cfgNumber(config, `${settingsBase}.imagePaddingLeft`, 0);
  const paddingRight = cfgNumber(config, `${settingsBase}.imagePaddingRight`, 0);

  const safeId = sectionId.replace(/[^a-z0-9_-]/gi, '-');
  const mobileClass = `codiic-iwt-image-${safeId}`;
  const width =
    desktopWidth === 'fit' ? 'min(100%, 420px)' : sizeCss(desktopWidth, desktopCustom);
  const mobileWidthCss =
    mobileWidth === 'fit' ? 'min(100%, 420px)' : sizeCss(mobileWidth, mobileCustom);
  const fixedHeight = Boolean(sectionHeightPx);
  const aspectCss = ASPECT_RATIO[aspect];
  const hasFixedAspect = Boolean(aspectCss);
  const isFillWidth = desktopWidth === 'fill';
  const radius = cornerRadius > 0 ? cornerRadius : undefined;
  const border = resolveImageWithTextBorderCss(
    config,
    {
      borderStyle,
      borderThickness,
      borderOpacity,
      borderColor,
    },
    scheme.muted
  );

  // Own width on the grid cell so Fit/Custom aren't eaten by 1fr stretch.
  const column: CSSProperties = {
    display: 'block',
    width: isFillWidth || (fixedHeight && isHorizontal) ? '100%' : width,
    maxWidth: '100%',
    height: fixedHeight && isHorizontal ? '100%' : undefined,
    minHeight: fixedHeight ? (isHorizontal ? 0 : sectionHeightPx) : undefined,
    justifySelf: isFillWidth || (fixedHeight && isHorizontal) ? 'stretch' : 'start',
    alignSelf: fixedHeight ? 'stretch' : 'start',
    boxSizing: 'border-box',
  };

  const panel: CSSProperties = {
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    boxSizing: 'border-box',
    width: '100%',
    height: fixedHeight && isHorizontal ? '100%' : undefined,
    minHeight: fixedHeight
      ? isHorizontal
        ? 0
        : sectionHeightPx
      : hasFixedAspect
        ? undefined
        : isHorizontal
          ? undefined
          : 280,
    border,
    borderRadius: radius,
    overflow: 'hidden',
  };

  // Aspect frame: width drives height via aspect-ratio. Children are absolutely
  // positioned so intrinsic image/SVG size cannot override the ratio.
  const media: CSSProperties = hasFixedAspect
    ? {
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        aspectRatio: aspectCss,
        maxHeight: fixedHeight && isHorizontal ? '100%' : undefined,
        borderRadius: radius,
        overflow: 'hidden',
        background: scheme.imagePanel,
        boxSizing: 'border-box',
        flexShrink: 0,
      }
    : {
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        minHeight: fixedHeight && isHorizontal ? 0 : 200,
        height: fixedHeight && isHorizontal ? '100%' : undefined,
        borderRadius: radius,
        overflow: 'hidden',
        background: scheme.imagePanel,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        flex: fixedHeight && isHorizontal ? '1 1 auto' : undefined,
      };

  const image: CSSProperties = hasFixedAspect
    ? {
        position: 'absolute',
        inset: 0,
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        borderRadius: radius,
      }
    : {
        display: 'block',
        width: '100%',
        height: fixedHeight ? '100%' : 'auto',
        maxWidth: '100%',
        maxHeight: fixedHeight ? '100%' : 360,
        objectFit: fixedHeight ? 'cover' : 'contain',
        borderRadius: radius,
      };

  const placeholder: CSSProperties = hasFixedAspect
    ? {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      };

  return {
    column,
    panel,
    media,
    image,
    placeholder,
    linkUrl,
    mobileClass,
    mobileWidthCss,
  };
}

export function imageWithTextImageMobileCss(mobileClass: string, mobileWidthCss: string): string {
  if (!mobileClass) return '';
  return atMobileBreakpoint(
    [
      `.${mobileClass} { width: ${mobileWidthCss} !important; max-width: 100% !important; }`,
      mobileWidthCss === 'auto' || mobileWidthCss === '100%'
        ? ''
        : `.${mobileClass} { justify-self: start !important; }`,
    ]
      .filter(Boolean)
      .join('\n')
  );
}

export function readImageWithTextHeadingStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  scheme: ImageWithTextScheme,
  fontHeading: string
): CSSProperties {
  const widthMode = cfgString(config, `${settingsBase}.headingWidth`, 'fit');
  const maxWidthMode = cfgString(config, `${settingsBase}.headingMaxWidth`, 'normal');
  const preset = cfgString(config, `${settingsBase}.headingTypographyPreset`, 'heading-3');
  const colorRaw = cfgString(config, `${settingsBase}.headingColor`, '');
  const backgroundEnabled = cfgBool(config, `${settingsBase}.headingBackgroundEnabled`, false);
  const backgroundColorRaw = cfgString(config, `${settingsBase}.headingBackgroundColor`, '#f3f4f6');
  const paddingTop = cfgNumber(config, `${settingsBase}.headingPaddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.headingPaddingBottom`, 0);
  const paddingLeft = cfgNumber(config, `${settingsBase}.headingPaddingLeft`, 0);
  const paddingRight = cfgNumber(config, `${settingsBase}.headingPaddingRight`, 0);
  const maxWidthPx =
    maxWidthMode === 'narrow' ? 360 : maxWidthMode === 'wide' ? 760 : 520;
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
    maxWidth: widthMode === 'fill' ? '100%' : maxWidthPx,
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

export function readImageWithTextBodyStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  scheme: ImageWithTextScheme,
  fontBody: string
): CSSProperties {
  const widthMode = cfgString(config, `${settingsBase}.descriptionWidth`, 'fit');
  const maxWidthMode = cfgString(config, `${settingsBase}.descriptionMaxWidth`, 'narrow');
  const preset = cfgString(config, `${settingsBase}.descriptionTypographyPreset`, 'default');
  const colorRaw = cfgString(config, `${settingsBase}.descriptionColor`, '');
  const backgroundEnabled = cfgBool(config, `${settingsBase}.descriptionBackgroundEnabled`, false);
  const backgroundColorRaw = cfgString(
    config,
    `${settingsBase}.descriptionBackgroundColor`,
    '#f3f4f6'
  );
  const paddingTop = cfgNumber(config, `${settingsBase}.descriptionPaddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsBase}.descriptionPaddingBottom`, 0);
  const paddingLeft = cfgNumber(config, `${settingsBase}.descriptionPaddingLeft`, 0);
  const paddingRight = cfgNumber(config, `${settingsBase}.descriptionPaddingRight`, 0);
  const maxWidthPx =
    maxWidthMode === 'narrow' ? 360 : maxWidthMode === 'wide' ? 760 : 520;
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

  const customFont = cfgString(config, `${settingsBase}.descriptionFont`, 'body');
  const customSizeRaw = cfgString(config, `${settingsBase}.descriptionFontSize`, '16px');
  const customSizePx = (() => {
    if (!customSizeRaw || customSizeRaw === 'default') return themeTypo.fontSize;
    const n = parseFloat(customSizeRaw);
    return Number.isFinite(n) && n > 0 ? n : themeTypo.fontSize;
  })();
  const customWeightStyle = resolveThemeFontWeightAndStyle(customFont);
  const customWrap = cfgString(config, `${settingsBase}.descriptionWrap`, 'pretty');
  const customCase = cfgString(config, `${settingsBase}.descriptionTextCase`, 'default');
  const customLetterSpacing = cfgString(config, `${settingsBase}.descriptionLetterSpacing`, 'normal');
  const customLineHeight = cfgString(config, `${settingsBase}.descriptionLineHeight`, 'normal');

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
    maxWidth: widthMode === 'fill' ? '100%' : maxWidthPx,
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

export type ImageWithTextButtonStyle = {
  style: CSSProperties;
  openInNewTab: boolean;
  mobileClass: string;
  mobileCss: string;
};

export function readImageWithTextButtonStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  scheme: ImageWithTextScheme,
  sectionId: string,
  fontBody: string
): ImageWithTextButtonStyle {
  const openInNewTab = cfgBool(config, `${settingsBase}.buttonOpenInNewTab`, false);
  const buttonStyleMode = cfgString(config, `${settingsBase}.buttonStyle`, 'primary');
  const buttonCustomBackground = cfgString(config, `${settingsBase}.buttonCustomBackground`, '#111827');
  const buttonCustomText = cfgString(config, `${settingsBase}.buttonCustomText`, '#ffffff');
  const linkTextColorRaw = cfgString(config, `${settingsBase}.buttonLinkTextColor`, '');
  const desktopWidthMode = cfgString(config, `${settingsBase}.buttonDesktopWidth`, 'fit');
  const mobileWidthMode = cfgString(config, `${settingsBase}.buttonMobileWidth`, 'fit');
  const desktopCustom = cfgNumber(config, `${settingsBase}.buttonDesktopCustomWidth`, 100);
  const mobileCustom = cfgNumber(config, `${settingsBase}.buttonMobileCustomWidth`, 100);

  const desktopWidth = sizeCss(desktopWidthMode, desktopCustom);
  const mobileWidth = sizeCss(mobileWidthMode, mobileCustom);
  const safeId = sectionId.replace(/[^a-z0-9_-]/gi, '-');
  const mobileClass = `codiic-iwt-btn-${safeId}`;

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
            padding: '12px 28px',
            textDecoration: 'none',
          }
        : {
            ...themeButtonStyle,
            padding: '12px 28px',
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
