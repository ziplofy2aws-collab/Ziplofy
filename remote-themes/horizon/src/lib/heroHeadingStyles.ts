import { cfgBool, cfgNumber, cfgString } from './config';

const TYPOGRAPHY_PRESETS: Record<string, { fontSize: number; fontWeight: number; lineHeight: number }> = {
  'heading-1': { fontSize: 40, fontWeight: 700, lineHeight: 1.15 },
  'heading-2': { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
  'heading-3': { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  'heading-4': { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
};

const MAX_WIDTH: Record<string, string | undefined> = {
  narrow: '480px',
  normal: '640px',
  wide: '960px',
  none: undefined,
};

export type HeroHeadingStyle = {
  width: string;
  maxWidth: string | undefined;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
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
  fontHeading: string,
  colors: { text: string; heading: string; accent: string }
): HeroHeadingStyle {
  const preset = cfgString(config, `${settingsBase}.headingTypographyPreset`, 'heading-2');
  const typo = TYPOGRAPHY_PRESETS[preset] ?? TYPOGRAPHY_PRESETS['heading-2'];
  const widthMode = cfgString(config, `${settingsBase}.headingWidth`, 'fit');
  const maxKey = cfgString(config, `${settingsBase}.headingMaxWidth`);
  const colorKey = cfgString(config, `${settingsBase}.headingColor`, 'heading');
  const color =
    colorKey === 'heading' ? colors.heading : colorKey === 'accent' ? colors.accent : colors.text;
  const bgOn = cfgBool(config, `${settingsBase}.headingBackgroundEnabled`, false);

  return {
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: MAX_WIDTH[maxKey] ?? MAX_WIDTH.normal,
    fontFamily: fontHeading,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    lineHeight: typo.lineHeight,
    color,
    background: bgOn ? 'rgba(255,255,255,0.08)' : undefined,
    paddingTop: cfgNumber(config, `${settingsBase}.headingPaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.headingPaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.headingPaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.headingPaddingRight`, 0),
    borderRadius: bgOn ? 6 : 0,
  };
}
