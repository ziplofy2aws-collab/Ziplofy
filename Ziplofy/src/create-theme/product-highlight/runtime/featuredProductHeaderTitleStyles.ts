import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

const TYPOGRAPHY_PRESETS: Record<string, { fontSize: number; fontWeight: number; lineHeight: number }> = {
  default: { fontSize: 28, fontWeight: 400, lineHeight: 1.25 },
  'heading-1': { fontSize: 32, fontWeight: 600, lineHeight: 1.15 },
  'heading-2': { fontSize: 28, fontWeight: 600, lineHeight: 1.2 },
  'heading-3': { fontSize: 24, fontWeight: 600, lineHeight: 1.25 },
  'heading-4': { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
};

const MAX_WIDTH: Record<string, string | undefined> = {
  narrow: '280px',
  normal: '100%',
  wide: '100%',
  none: undefined,
};

export type FeaturedProductHeaderTitleStyle = {
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
  margin: number;
};

export function readFeaturedProductHeaderTitleStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fontHeading: string,
  color: string
): FeaturedProductHeaderTitleStyle {
  const preset = cfgString(config, `${settingsBase}.typographyPreset`, 'default');
  const typo = TYPOGRAPHY_PRESETS[preset] ?? TYPOGRAPHY_PRESETS.default;
  const widthMode = cfgString(config, `${settingsBase}.width`, 'fit');
  const maxKey = cfgString(config, `${settingsBase}.maxWidth`, 'normal');
  const bgOn = cfgBool(config, `${settingsBase}.backgroundEnabled`, false);

  return {
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: MAX_WIDTH[maxKey] ?? MAX_WIDTH.normal,
    fontFamily: fontHeading,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    lineHeight: typo.lineHeight,
    color,
    background: bgOn ? 'rgba(0,0,0,0.04)' : undefined,
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
    borderRadius: bgOn ? 6 : 0,
    margin: 0,
  };
}
