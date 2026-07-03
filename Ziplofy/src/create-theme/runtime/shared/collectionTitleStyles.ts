import type { CSSProperties } from 'react';
import {
  isThemePaletteColorSetting,
  resolveThemePaletteColorSetting,
} from '../../settings/theme-color-palette.settings';
import { cfgBool, cfgNumber, cfgString } from './config';
import {
  letterSpacingCss,
  lineHeightMultiplier,
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  resolveThemeTextPreset,
  resolveThemeTypographyStyle,
  themeFontsFromConfig,
  type ThemeFonts,
} from './themeTypographyRuntime';

const MAX_WIDTH: Record<string, string | undefined> = {
  narrow: '480px',
  normal: '640px',
  wide: '960px',
  none: undefined,
};

const TYPOGRAPHY_PRESETS: Record<string, string> = {
  default: 'paragraph',
  paragraph: 'paragraph',
  body: 'paragraph',
  'heading-1': 'heading-1',
  'heading-2': 'heading-2',
  'heading-3': 'heading-3',
  'heading-4': 'heading-4',
  'heading-5': 'heading-5',
  'heading-6': 'heading-6',
};

function parseFontSizePx(raw: string, fallback: number): number {
  if (raw === 'default' || !raw.trim()) return fallback;
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function readCustomTitleTypography(
  config: Record<string, unknown> | null,
  settingsBase: string,
  themeFonts: ThemeFonts
): Pick<
  CollectionTitleStyle,
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'letterSpacing'
  | 'textTransform'
  | 'textWrap'
  | 'fontStyle'
> {
  const fontKey = cfgString(config, `${settingsBase}.titleFont`, 'body');
  const sizeRaw = cfgString(config, `${settingsBase}.titleFontSize`, 'default');
  const lhKey = cfgString(config, `${settingsBase}.titleLineHeight`, 'normal');
  const lsKey = cfgString(config, `${settingsBase}.titleLetterSpacing`, 'normal');
  const caseKey = cfgString(config, `${settingsBase}.titleTextCase`, 'default');
  const wrapKey = cfgString(config, `${settingsBase}.titleWrap`, 'pretty');

  const defaultSize = resolveThemeTextPreset(config, 'paragraph').size;
  const fontFamily = resolveThemeFontFamily(fontKey, themeFonts);
  const fontSize = parseFontSizePx(sizeRaw, defaultSize);
  const lineHeight = lineHeightMultiplier(lhKey);
  const letterSpacing = letterSpacingCss(lsKey);
  const textTransform: CSSProperties['textTransform'] =
    caseKey === 'uppercase' ? 'uppercase' : 'none';
  const textWrap = wrapKey === 'nowrap' ? 'nowrap' : wrapKey === 'balance' ? 'balance' : 'pretty';

  const weightStyle = resolveThemeFontWeightAndStyle(fontKey);
  const fontWeight = weightStyle.fontWeight ?? 400;
  const fontStyle = weightStyle.fontStyle ?? 'normal';

  return {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    textTransform,
    textWrap,
    fontStyle,
  };
}

export type CollectionTitleStyle = {
  flex: string | undefined;
  width: string;
  maxWidth: string | undefined;
  textAlign: CSSProperties['textAlign'];
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: CSSProperties['fontStyle'];
  lineHeight: number;
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

export function readCollectionTitleStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fonts: { heading: string; body: string },
  colors: { text: string; heading: string; accent: string; background: string }
): CollectionTitleStyle {
  const presetRaw = cfgString(config, `${settingsBase}.titleTypographyPreset`, 'heading-3');
  const presetKey = TYPOGRAPHY_PRESETS[presetRaw] ?? presetRaw;
  const themeFonts = themeFontsFromConfig(config);
  const mergedFonts: ThemeFonts = {
    ...themeFonts,
    fontBody: themeFonts.fontBody || fonts.body,
    fontHeading: themeFonts.fontHeading || fonts.heading,
  };
  const presetTypo =
    presetRaw === 'custom'
      ? null
      : resolveThemeTypographyStyle(config, presetKey, mergedFonts);
  const customTypo =
    presetRaw === 'custom' ? readCustomTitleTypography(config, settingsBase, mergedFonts) : null;

  const widthMode = cfgString(config, `${settingsBase}.titleWidth`, 'fit');
  const isFill = widthMode === 'fill';
  const maxKey = cfgString(config, `${settingsBase}.titleMaxWidth`, 'normal');
  const maxWidth = MAX_WIDTH[maxKey] ?? MAX_WIDTH.normal;
  const alignRaw = cfgString(config, `${settingsBase}.titleAlignment`, 'left');
  const textAlign: CSSProperties['textAlign'] =
    alignRaw === 'right' ? 'right' : alignRaw === 'center' ? 'center' : 'left';
  const colorKey = cfgString(config, `${settingsBase}.titleColor`, 'text');
  const color =
    isThemePaletteColorSetting(colorKey) || colorKey.startsWith('#')
      ? resolveThemePaletteColorSetting(config, colorKey, 1, colors.text)
      : colorKey === 'heading'
        ? colors.heading
        : colorKey === 'accent'
          ? colors.accent
          : colors.text;
  const bgOn = cfgBool(config, `${settingsBase}.titleBackgroundEnabled`, false);
  const bgColor = cfgString(config, `${settingsBase}.titleBackgroundColor`, '#00000026');
  const cornerRadius = cfgNumber(config, `${settingsBase}.titleCornerRadius`, 0);

  return {
    flex: isFill ? '1 1 auto' : '0 0 auto',
    width: isFill ? 'auto' : 'fit-content',
    maxWidth,
    textAlign: isFill ? textAlign : undefined,
    fontFamily: customTypo?.fontFamily ?? presetTypo?.fontFamily ?? mergedFonts.fontHeading,
    fontSize: customTypo?.fontSize ?? presetTypo?.fontSize ?? 24,
    fontWeight: customTypo?.fontWeight ?? presetTypo?.fontWeight ?? 600,
    fontStyle: customTypo?.fontStyle ?? presetTypo?.fontStyle,
    lineHeight: customTypo?.lineHeight ?? presetTypo?.lineHeight ?? 1.25,
    letterSpacing: customTypo?.letterSpacing ?? presetTypo?.letterSpacing,
    textTransform: customTypo?.textTransform ?? presetTypo?.textTransform,
    textWrap: customTypo?.textWrap,
    color,
    background: bgOn ? bgColor : undefined,
    paddingTop: cfgNumber(config, `${settingsBase}.titlePaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.titlePaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.titlePaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.titlePaddingRight`, 0),
    borderRadius: bgOn ? cornerRadius : 0,
  };
}
