import type { CSSProperties } from 'react';
import { cfgString } from './config';

export type AnnouncementBlockTypography = {
  fontFamily: string;
  fontSize: string;
  fontWeight: number | undefined;
  letterSpacing: string;
  textTransform: CSSProperties['textTransform'];
};

export function readAnnouncementBlockTypography(
  config: Record<string, unknown> | null,
  blockSettingsBase: string,
  themeFonts: { fontHeading: string; fontBody: string }
): AnnouncementBlockTypography {
  const font = cfgString(config, `${blockSettingsBase}.font`, 'subheading');
  const fontSize = cfgString(config, `${blockSettingsBase}.fontSize`, '12px');
  const weightKey = cfgString(config, `${blockSettingsBase}.fontWeight`, 'default');
  const letterSpacingKey = cfgString(config, `${blockSettingsBase}.letterSpacing`);
  const textCase = cfgString(config, `${blockSettingsBase}.textCase`, 'default');

  const fontFamily =
    font === 'heading'
      ? themeFonts.fontHeading
      : font === 'body' || font === 'accent'
        ? themeFonts.fontBody
        : themeFonts.fontBody;

  const letterSpacing =
    letterSpacingKey === 'tight' ? '-0.02em' : letterSpacingKey === 'wide' ? '0.08em' : 'normal';

  const fontWeight =
    weightKey === 'default' ? undefined : Number.isFinite(Number(weightKey)) ? Number(weightKey) : undefined;

  return {
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    textTransform: textCase === 'uppercase' ? 'uppercase' : 'none',
  };
}

export function typographyToStyle(t: AnnouncementBlockTypography): CSSProperties {
  return {
    fontFamily: t.fontFamily,
    fontSize: t.fontSize,
    fontWeight: t.fontWeight,
    letterSpacing: t.letterSpacing,
    textTransform: t.textTransform,
  };
}
