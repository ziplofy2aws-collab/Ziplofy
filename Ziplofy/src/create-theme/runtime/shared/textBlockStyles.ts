import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from './config';

const TEXT_TYPOGRAPHY_PRESETS: Record<
  string,
  { fontSize: number; fontWeight: number; lineHeight: number; fontFamilyKey: 'heading' | 'body' }
> = {
  default: { fontSize: 15, fontWeight: 400, lineHeight: 1.5, fontFamilyKey: 'body' },
  paragraph: { fontSize: 15, fontWeight: 400, lineHeight: 1.5, fontFamilyKey: 'body' },
  body: { fontSize: 15, fontWeight: 400, lineHeight: 1.5, fontFamilyKey: 'body' },
  'heading-1': { fontSize: 32, fontWeight: 600, lineHeight: 1.15, fontFamilyKey: 'heading' },
  'heading-2': { fontSize: 28, fontWeight: 600, lineHeight: 1.2, fontFamilyKey: 'heading' },
  'heading-3': { fontSize: 24, fontWeight: 600, lineHeight: 1.25, fontFamilyKey: 'heading' },
  'heading-4': { fontSize: 20, fontWeight: 600, lineHeight: 1.3, fontFamilyKey: 'heading' },
  'heading-5': { fontSize: 18, fontWeight: 600, lineHeight: 1.35, fontFamilyKey: 'heading' },
  'heading-6': { fontSize: 14, fontWeight: 600, lineHeight: 1.4, fontFamilyKey: 'heading' },
};

const TEXT_MAX_WIDTH: Record<string, string | undefined> = {
  narrow: '280px',
  normal: '100%',
  wide: '100%',
  none: undefined,
};

function alignSelfFromTextAlignment(alignment: string): CSSProperties['alignSelf'] {
  if (alignment === 'center') return 'center';
  if (alignment === 'right') return 'flex-end';
  return 'flex-start';
}

/** Positions the text block within a flex parent (width, max width, alignment). */
export function readTextBlockLayoutStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): CSSProperties {
  const widthMode = cfgString(config, `${settingsBase}.width`, 'fill');
  const maxKey = cfgString(config, `${settingsBase}.maxWidth`, 'normal');
  const alignment = cfgString(config, `${settingsBase}.alignment`, 'left');
  const maxWidth = TEXT_MAX_WIDTH[maxKey];

  if (widthMode === 'fit') {
    return {
      width: 'fit-content',
      maxWidth: maxWidth ?? undefined,
      alignSelf: alignSelfFromTextAlignment(alignment),
    };
  }

  return {
    width: '100%',
    maxWidth: maxWidth ?? undefined,
    alignSelf: 'stretch',
    marginLeft: alignment === 'right' || alignment === 'center' ? 'auto' : undefined,
    marginRight: alignment === 'center' ? 'auto' : undefined,
  };
}

export function readTextBlockStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  themeFonts: { fontHeading: string; fontBody: string },
  color: string
): CSSProperties {
  const preset = cfgString(config, `${settingsBase}.typographyPreset`, 'default');
  const typo = TEXT_TYPOGRAPHY_PRESETS[preset] ?? TEXT_TYPOGRAPHY_PRESETS.default;
  const widthMode = cfgString(config, `${settingsBase}.width`, 'fill');
  const maxKey = cfgString(config, `${settingsBase}.maxWidth`, 'normal');
  const alignment = cfgString(config, `${settingsBase}.alignment`, 'left');
  const bgOn = cfgBool(config, `${settingsBase}.backgroundEnabled`, false);

  return {
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: TEXT_MAX_WIDTH[maxKey] ?? TEXT_MAX_WIDTH.normal,
    textAlign: alignment === 'center' || alignment === 'right' ? alignment : 'left',
    fontFamily: typo.fontFamilyKey === 'heading' ? themeFonts.fontHeading : themeFonts.fontBody,
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
    boxSizing: 'border-box',
  };
}
