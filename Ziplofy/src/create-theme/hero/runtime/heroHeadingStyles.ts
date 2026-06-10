import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

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

const TYPOGRAPHY_PRESETS: Record<string, { fontSize: number; fontWeight: number; lineHeight: number }> = {
  default: { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
  paragraph: { fontSize: 15, fontWeight: 400, lineHeight: 1.5 },
  body: { fontSize: 15, fontWeight: 400, lineHeight: 1.5 },
  'heading-1': { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
  'heading-2': { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
  'heading-3': { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  'heading-4': { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  'heading-5': { fontSize: 18, fontWeight: 600, lineHeight: 1.35 },
  'heading-6': { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
};

const MAX_WIDTH: Record<string, string | undefined> = {
  narrow: '480px',
  normal: '640px',
  wide: '960px',
  none: undefined,
};

function lineHeightMultiplier(key: string): number {
  if (key === 'tight') return 1.1;
  if (key === 'loose') return 1.55;
  return 1.35;
}

function letterSpacingCss(key: string): string {
  if (key === 'tight') return '-0.02em';
  if (key === 'loose') return '0.06em';
  return 'normal';
}

function parseFontSizePx(raw: string, fallback: number): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function readCustomHeadingTypography(
  config: Record<string, unknown> | null,
  settingsBase: string,
  themeFonts: { fontHeading: string; fontBody: string }
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

  const fontFamily = fontKey === 'heading' ? themeFonts.fontHeading : themeFonts.fontBody;
  const fontSize = parseFontSizePx(sizeRaw, 16);
  const lineHeight = lineHeightMultiplier(lhKey);
  const letterSpacing = letterSpacingCss(lsKey);
  const textTransform: CSSProperties['textTransform'] =
    caseKey === 'uppercase' ? 'uppercase' : 'none';
  const textWrap = wrapKey === 'nowrap' ? 'nowrap' : wrapKey === 'balance' ? 'balance' : 'pretty';

  let fontWeight = 400;
  let fontStyle: CSSProperties['fontStyle'] = 'normal';
  if (fontKey === 'heading') fontWeight = 700;
  else if (fontKey === 'subheading') fontWeight = 600;
  else if (fontKey === 'accent') fontStyle = 'italic';

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
  themeFonts: { fontHeading: string; fontBody: string },
  colors: { text: string; heading: string; link: string; accent?: string }
): HeroHeadingStyle {
  const preset = cfgString(config, `${settingsBase}.headingTypographyPreset`, 'heading-1');
  const presetTypo = TYPOGRAPHY_PRESETS[preset] ?? TYPOGRAPHY_PRESETS['heading-1'];
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
    fontFamily: customTypo?.fontFamily ?? themeFonts.fontHeading,
    fontSize: customTypo?.fontSize ?? presetTypo.fontSize,
    fontWeight: customTypo?.fontWeight ?? presetTypo.fontWeight,
    lineHeight: customTypo?.lineHeight ?? presetTypo.lineHeight,
    fontStyle: customTypo?.fontStyle,
    letterSpacing: customTypo?.letterSpacing,
    textTransform: customTypo?.textTransform,
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
