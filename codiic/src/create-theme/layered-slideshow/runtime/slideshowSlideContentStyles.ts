import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import {
  isThemePaletteColorSetting,
  resolveThemePaletteColorSetting,
} from '../../settings/theme-color-palette.settings';
import {
  letterSpacingCss,
  lineHeightMultiplier,
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  resolveThemeTypographyStyle,
  type ThemeFonts,
} from '../../runtime/shared/themeTypographyRuntime';

const TYPOGRAPHY_PRESETS: Record<string, string> = {
  default: 'heading-1',
  paragraph: 'paragraph',
  body: 'paragraph',
  'heading-1': 'heading-1',
  'heading-2': 'heading-2',
  'heading-3': 'heading-3',
  'heading-4': 'heading-4',
  'heading-5': 'heading-5',
  'heading-6': 'heading-6',
};

const MAX_WIDTH: Record<string, string | undefined> = {
  narrow: '480px',
  normal: '640px',
  wide: '960px',
  none: undefined,
};

function parseFontSizePx(raw: string, fallback: number): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function readCustomPrefixTypography(
  config: Record<string, unknown> | null,
  settingsBase: string,
  prefix: 'heading' | 'body',
  themeFonts: ThemeFonts,
  defaultSize: number
) {
  const fontKey = cfgString(config, `${settingsBase}.${prefix}Font`, prefix === 'heading' ? 'heading' : 'body');
  const sizeRaw = cfgString(config, `${settingsBase}.${prefix}FontSize`, `${defaultSize}px`);
  const lhKey = cfgString(config, `${settingsBase}.${prefix}LineHeight`, 'normal');
  const lsKey = cfgString(config, `${settingsBase}.${prefix}LetterSpacing`, 'normal');
  const caseKey = cfgString(config, `${settingsBase}.${prefix}TextCase`, 'default');
  const wrapKey = cfgString(config, `${settingsBase}.${prefix}Wrap`, 'pretty');
  const weightStyle = resolveThemeFontWeightAndStyle(fontKey);

  return {
    fontFamily: resolveThemeFontFamily(fontKey, themeFonts),
    fontSize: parseFontSizePx(sizeRaw, defaultSize),
    fontWeight: weightStyle.fontWeight ?? (prefix === 'heading' ? 600 : 400),
    lineHeight: lineHeightMultiplier(lhKey),
    letterSpacing: letterSpacingCss(lsKey),
    textTransform: (caseKey === 'uppercase' ? 'uppercase' : 'none') as CSSProperties['textTransform'],
    textWrap: wrapKey === 'nowrap' ? 'nowrap' : wrapKey === 'balance' ? 'balance' : 'pretty',
    fontStyle: weightStyle.fontStyle ?? 'normal',
  };
}

export type SlideshowSlideTextStyle = {
  width: string;
  maxWidth: string | undefined;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily: string;
  fontSize: number | string;
  fontWeight: number;
  lineHeight: number;
  fontStyle?: CSSProperties['fontStyle'];
  letterSpacing?: string;
  textTransform?: CSSProperties['textTransform'];
  textWrap?: string;
  color: string;
  background: string | undefined;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  borderRadius: number;
};

export function readSlideshowSlideTextStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  prefix: 'heading' | 'body',
  themeFonts: ThemeFonts,
  colors: { text: string; heading: string; muted: string; link: string; accent?: string },
  fallbackAlign: 'left' | 'center' | 'right' = 'left'
): SlideshowSlideTextStyle {
  const defaultPreset = prefix === 'heading' ? 'heading-1' : 'paragraph';
  const preset = cfgString(config, `${settingsBase}.${prefix}TypographyPreset`, defaultPreset);
  const presetKey =
    TYPOGRAPHY_PRESETS[preset] ?? (prefix === 'heading' ? 'heading-1' : 'paragraph');
  const presetTypo =
    preset === 'custom' ? null : resolveThemeTypographyStyle(config, presetKey, themeFonts);
  const customTypo =
    preset === 'custom'
      ? readCustomPrefixTypography(config, settingsBase, prefix, themeFonts, prefix === 'heading' ? 32 : 16)
      : null;

  const widthMode = cfgString(config, `${settingsBase}.${prefix}Width`, 'fit');
  const isFill = widthMode === 'fill';
  let maxKey = cfgString(config, `${settingsBase}.${prefix}MaxWidth`, 'normal');
  if (maxKey === 'wide') maxKey = 'normal';
  const maxWidth = maxKey === 'none' ? undefined : MAX_WIDTH[maxKey] ?? MAX_WIDTH.normal;

  const alignRaw = cfgString(config, `${settingsBase}.${prefix}Alignment`, fallbackAlign);
  const textAlign: SlideshowSlideTextStyle['textAlign'] =
    alignRaw === 'right' ? 'right' : alignRaw === 'center' ? 'center' : 'left';

  const colorKey = cfgString(
    config,
    `${settingsBase}.${prefix}Color`,
    prefix === 'heading' ? 'heading' : 'text'
  );
  const color =
    isThemePaletteColorSetting(colorKey) || colorKey.startsWith('#')
      ? resolveThemePaletteColorSetting(config, colorKey, 1, colors.text)
      : colorKey === 'heading'
        ? colors.heading
        : colorKey === 'link'
          ? colors.link
          : colorKey === 'accent'
            ? colors.accent ?? colors.link
            : colorKey === 'muted'
              ? colors.muted
              : colors.text;

  const bgOn = cfgBool(config, `${settingsBase}.${prefix}BackgroundEnabled`, false);
  const bgColor = cfgString(config, `${settingsBase}.${prefix}BackgroundColor`, '#00000026');
  const cornerRadius = cfgNumber(config, `${settingsBase}.${prefix}CornerRadius`, 0);

  return {
    width: isFill ? '100%' : 'fit-content',
    maxWidth,
    textAlign,
    fontFamily:
      customTypo?.fontFamily ??
      presetTypo?.fontFamily ??
      (prefix === 'heading' ? themeFonts.fontHeading : themeFonts.fontBody),
    fontSize:
      customTypo?.fontSize ??
      presetTypo?.fontSize ??
      (prefix === 'heading' ? 32 : 16),
    fontWeight:
      customTypo?.fontWeight ??
      presetTypo?.fontWeight ??
      (prefix === 'heading' ? 700 : 400),
    lineHeight: customTypo?.lineHeight ?? presetTypo?.lineHeight ?? (prefix === 'heading' ? 1.1 : 1.5),
    fontStyle: customTypo?.fontStyle ?? presetTypo?.fontStyle,
    letterSpacing: customTypo?.letterSpacing ?? presetTypo?.letterSpacing,
    textTransform: customTypo?.textTransform ?? presetTypo?.textTransform,
    textWrap: customTypo?.textWrap,
    color,
    background: bgOn ? bgColor : undefined,
    paddingTop: cfgNumber(config, `${settingsBase}.${prefix}PaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.${prefix}PaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.${prefix}PaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.${prefix}PaddingRight`, 0),
    borderRadius: bgOn ? cornerRadius : 0,
  };
}

export function slideshowSlideTextStyleToCss(style: SlideshowSlideTextStyle): CSSProperties {
  return {
    margin: 0,
    width: style.width,
    maxWidth: style.maxWidth,
    textAlign: style.textAlign,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    ...(style.fontStyle ? { fontStyle: style.fontStyle } : {}),
    ...(style.letterSpacing ? { letterSpacing: style.letterSpacing } : {}),
    ...(style.textTransform ? { textTransform: style.textTransform } : {}),
    ...(style.textWrap ? { textWrap: style.textWrap as CSSProperties['textWrap'] } : {}),
    color: style.color,
    background: style.background,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    paddingRight: style.paddingRight,
    borderRadius: style.borderRadius,
    boxSizing: 'border-box',
  };
}

export type SlideshowSlideButtonStyle = {
  style: CSSProperties;
  openInNewTab: boolean;
  href: string;
  label: string;
};

export function readSlideshowSlideButtonStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  scheme: { color: string; muted: string },
  fallbacks: { label: string; href: string }
): SlideshowSlideButtonStyle {
  const label = cfgString(config, `${settingsBase}.buttonLabel`, fallbacks.label);
  const href = cfgString(config, `${settingsBase}.buttonHref`, fallbacks.href);
  const openInNewTab = cfgBool(config, `${settingsBase}.buttonOpenInNewTab`, false);
  const buttonStyle = cfgString(config, `${settingsBase}.buttonStyle`, 'primary');
  const buttonLinkTextColor = cfgString(config, `${settingsBase}.buttonLinkTextColor`, '');
  const buttonCustomBackground = cfgString(config, `${settingsBase}.buttonCustomBackground`, '#111827');
  const buttonCustomText = cfgString(config, `${settingsBase}.buttonCustomText`, '#ffffff');
  const desktopWidth = cfgString(config, `${settingsBase}.buttonDesktopWidth`, 'fit');
  const desktopCustomWidth = cfgNumber(config, `${settingsBase}.buttonDesktopCustomWidth`, 50);
  const widthStyle: CSSProperties = {
    width: desktopWidth === 'custom' ? `${desktopCustomWidth}%` : 'fit-content',
    maxWidth: '100%',
    boxSizing: 'border-box',
  };

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ...widthStyle,
  };

  let style: CSSProperties;
  if (buttonStyle === 'secondary') {
    style = {
      ...base,
      color: scheme.color,
      background: 'transparent',
      padding: '10px 18px',
      borderRadius: 8,
      border: `1px solid ${scheme.muted}66`,
    };
  } else if (buttonStyle === 'custom') {
    style = {
      ...base,
      color: buttonCustomText,
      background: buttonCustomBackground,
      padding: '10px 18px',
      borderRadius: 8,
    };
  } else if (buttonStyle === 'link') {
    style = {
      ...base,
      fontSize: 15,
      fontWeight: 500,
      color: buttonLinkTextColor || scheme.color,
      background: 'transparent',
      textDecoration: 'underline',
      textUnderlineOffset: 3,
      padding: '4px 0',
      borderRadius: 0,
    };
  } else {
    style = {
      ...base,
      color: '#ffffff',
      background: '#111827',
      padding: '12px 26px',
      borderRadius: 999,
    };
  }

  return { style, openInNewTab, href, label };
}
