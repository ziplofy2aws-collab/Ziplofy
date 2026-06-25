import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import {
  resolveThemeTypographyStyle,
  lineHeightMultiplier,
  letterSpacingCss,
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  type ThemeFonts,
} from '../../runtime/shared/themeTypographyRuntime';

/** Hero heading rich text: section `title` is canonical; block `heading` is kept in sync. */
export function readHeroHeadingText(
  config: Record<string, unknown> | null,
  settingsBase: string,
  blocksBase: string,
  blockId: string
): string {
  const title = cfgString(config, `${settingsBase}.title`, '');
  const block = cfgString(config, `${blocksBase}.${blockId}.settings.heading`, '');
  if (blockId === 'heading') return title.trim() ? title : block;
  return block.trim() ? block : title;
}

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

function readCustomHeadingTypography(
  config: Record<string, unknown> | null,
  settingsBase: string,
  themeFonts: ThemeFonts
): Pick<
  HeroHeadingStyle,
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'letterSpacing'
  | 'textTransform'
  | 'textWrap'
  | 'fontStyle'
> {
  const fontKey = cfgString(config, `${settingsBase}.headingFont`, 'body');
  const sizeRaw = cfgString(config, `${settingsBase}.headingFontSize`, '16px');
  const lhKey = cfgString(config, `${settingsBase}.headingLineHeight`, 'normal');
  const lsKey = cfgString(config, `${settingsBase}.headingLetterSpacing`, 'normal');
  const caseKey = cfgString(config, `${settingsBase}.headingTextCase`, 'default');
  const wrapKey = cfgString(config, `${settingsBase}.headingWrap`, 'pretty');

  const fontFamily = resolveThemeFontFamily(fontKey, themeFonts);
  const fontSize = parseFontSizePx(sizeRaw, 16);
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

function parseFontSizePx(raw: string, fallback: number): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export type HeroHeadingStyle = {
  width: string;
  maxWidth: string | undefined;
  marginLeft?: string;
  marginRight?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily: string;
  fontSize: number;
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

export function readHeroHeadingStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  themeFonts: ThemeFonts,
  colors: { text: string; heading: string; link: string; accent?: string }
): HeroHeadingStyle {
  const preset = cfgString(config, `${settingsBase}.headingTypographyPreset`, 'heading-1');
  const presetKey = TYPOGRAPHY_PRESETS[preset] ?? 'heading-1';
  const presetTypo =
    preset === 'custom' ? null : resolveThemeTypographyStyle(config, presetKey, themeFonts);
  const customTypo =
    preset === 'custom' ? readCustomHeadingTypography(config, settingsBase, themeFonts) : null;

  const widthMode = cfgString(config, `${settingsBase}.headingWidth`, 'fit');
  const isFill = widthMode === 'fill';
  let maxKey = cfgString(config, `${settingsBase}.headingMaxWidth`, 'normal');
  if (maxKey === 'wide') maxKey = 'normal';
  const maxWidth =
    maxKey === 'none' ? undefined : MAX_WIDTH[maxKey] ?? MAX_WIDTH.normal;
  const alignRaw = cfgString(config, `${settingsBase}.headingAlignment`, 'left');
  const textAlign: HeroHeadingStyle['textAlign'] =
    alignRaw === 'right' ? 'right' : alignRaw === 'center' ? 'center' : 'left';
  const colorKey = cfgString(config, `${settingsBase}.headingColor`, 'heading');
  const color =
    colorKey === 'heading'
      ? colors.heading
      : colorKey === 'link'
        ? colors.link
        : colorKey === 'accent'
          ? colors.accent ?? colors.link
          : colors.text;
  const bgOn = cfgBool(config, `${settingsBase}.headingBackgroundEnabled`, false);
  const bgColor = cfgString(config, `${settingsBase}.headingBackgroundColor`, '#00000026');
  const cornerRadius = cfgNumber(config, `${settingsBase}.headingCornerRadius`, 0);

  const marginLeft =
    isFill && maxWidth && textAlign !== 'left'
      ? textAlign === 'center' || textAlign === 'right'
        ? 'auto'
        : undefined
      : undefined;
  const marginRight =
    isFill && maxWidth && textAlign === 'center' ? 'auto' : undefined;

  return {
    width: isFill ? '100%' : 'fit-content',
    maxWidth,
    marginLeft,
    marginRight,
    textAlign,
    fontFamily: customTypo?.fontFamily ?? presetTypo?.fontFamily ?? themeFonts.fontHeading,
    fontSize: customTypo?.fontSize ?? presetTypo?.fontSize ?? 32,
    fontWeight: customTypo?.fontWeight ?? presetTypo?.fontWeight ?? 600,
    lineHeight: customTypo?.lineHeight ?? presetTypo?.lineHeight ?? 1.2,
    fontStyle: customTypo?.fontStyle ?? presetTypo?.fontStyle,
    letterSpacing: customTypo?.letterSpacing ?? presetTypo?.letterSpacing,
    textTransform: customTypo?.textTransform ?? presetTypo?.textTransform,
    textWrap: customTypo?.textWrap,
    color,
    background: bgOn ? bgColor : undefined,
    paddingTop: cfgNumber(config, `${settingsBase}.headingPaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.headingPaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.headingPaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.headingPaddingRight`, 0),
    borderRadius: bgOn ? cornerRadius : 0,
  };
}

/** Maps heading typography tokens to inline CSS (preset or custom). */
export function heroHeadingTypographyCss(
  style: Pick<
    HeroHeadingStyle,
    | 'fontFamily'
    | 'fontSize'
    | 'fontWeight'
    | 'lineHeight'
    | 'fontStyle'
    | 'letterSpacing'
    | 'textTransform'
    | 'textWrap'
  >
): CSSProperties {
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    ...(style.fontStyle ? { fontStyle: style.fontStyle } : {}),
    ...(style.letterSpacing ? { letterSpacing: style.letterSpacing } : {}),
    ...(style.textTransform ? { textTransform: style.textTransform } : {}),
    ...(style.textWrap
      ? { textWrap: style.textWrap as CSSProperties['textWrap'] }
      : {}),
  };
}
