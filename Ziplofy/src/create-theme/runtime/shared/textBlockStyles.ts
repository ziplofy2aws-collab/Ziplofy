import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from './config';
import {
  resolveThemeTypographyStyle,
  type ThemeFonts,
} from './themeTypographyRuntime';

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

export type TextBlockStyleDefaults = {
  width?: string;
  maxWidth?: string;
  alignment?: string;
  typographyPreset?: string;
  backgroundEnabled?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
};

/** Positions the text block within a flex parent (width, max width, alignment). */
export function readTextBlockLayoutStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  defaults?: TextBlockStyleDefaults
): CSSProperties {
  const widthMode = cfgString(config, `${settingsBase}.width`, defaults?.width ?? 'fill');
  const maxKey = cfgString(config, `${settingsBase}.maxWidth`, defaults?.maxWidth ?? 'normal');
  const alignment = cfgString(config, `${settingsBase}.alignment`, defaults?.alignment ?? 'left');
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
  themeFonts: ThemeFonts,
  color: string,
  defaults?: TextBlockStyleDefaults
): CSSProperties {
  const preset = cfgString(
    config,
    `${settingsBase}.typographyPreset`,
    defaults?.typographyPreset ?? 'default'
  );
  const typo = resolveThemeTypographyStyle(config, preset, themeFonts);
  const widthMode = cfgString(config, `${settingsBase}.width`, defaults?.width ?? 'fill');
  const maxKey = cfgString(config, `${settingsBase}.maxWidth`, defaults?.maxWidth ?? 'normal');
  const alignment = cfgString(config, `${settingsBase}.alignment`, defaults?.alignment ?? 'left');
  const bgOn = cfgBool(
    config,
    `${settingsBase}.backgroundEnabled`,
    defaults?.backgroundEnabled ?? false
  );

  return {
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: TEXT_MAX_WIDTH[maxKey] ?? TEXT_MAX_WIDTH.normal,
    textAlign: alignment === 'center' || alignment === 'right' ? alignment : 'left',
    fontFamily: typo.fontFamily,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    fontStyle: typo.fontStyle,
    lineHeight: typo.lineHeight,
    letterSpacing: typo.letterSpacing,
    textTransform: typo.textTransform,
    color,
    background: bgOn ? 'rgba(0,0,0,0.04)' : undefined,
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, defaults?.paddingTop ?? 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, defaults?.paddingBottom ?? 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, defaults?.paddingLeft ?? 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, defaults?.paddingRight ?? 0),
    borderRadius: bgOn ? 6 : 0,
    boxSizing: 'border-box',
  };
}
