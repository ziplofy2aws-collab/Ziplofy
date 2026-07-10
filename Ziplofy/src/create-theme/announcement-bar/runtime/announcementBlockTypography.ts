import type { CSSProperties } from 'react';
import { cfgString } from '../../runtime/shared/config';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';

export type AnnouncementBlockTypography = {
  fontFamily: string;
  fontSize: string | undefined;
  fontWeight: number | undefined;
  letterSpacing: string;
  textTransform: CSSProperties['textTransform'];
  color: string | undefined;
};

export function readAnnouncementBlockTypography(
  config: Record<string, unknown> | null,
  blockSettingsBase: string,
  themeFonts: {
    fontHeading: string;
    fontBody: string;
    fontSubheading?: string;
    fontAccent?: string;
  }
): AnnouncementBlockTypography {
  const font = cfgString(config, `${blockSettingsBase}.font`, 'subheading');
  const fontSizeKey = cfgString(config, `${blockSettingsBase}.fontSize`, '12px');
  const fontSize = !fontSizeKey || fontSizeKey === 'default' ? undefined : fontSizeKey;
  const weightKey = cfgString(config, `${blockSettingsBase}.fontWeight`, 'default');
  const letterSpacingKey = cfgString(config, `${blockSettingsBase}.letterSpacing`);
  const textCase = cfgString(config, `${blockSettingsBase}.textCase`, 'default');
  const textColorRaw = cfgString(config, `${blockSettingsBase}.textColor`, '').trim();

  const fontFamily =
    font === 'heading'
      ? themeFonts.fontHeading
      : font === 'accent'
        ? themeFonts.fontAccent || themeFonts.fontBody
        : font === 'subheading'
          ? themeFonts.fontSubheading || themeFonts.fontHeading
          : themeFonts.fontBody;

  const letterSpacing =
    letterSpacingKey === 'tight' ? '-0.02em' : letterSpacingKey === 'wide' ? '0.08em' : 'normal';

  const fontWeight =
    weightKey === 'default' ? undefined : Number.isFinite(Number(weightKey)) ? Number(weightKey) : undefined;

  const color = textColorRaw
    ? resolveThemePaletteColorSetting(config, textColorRaw, 1, '#111827')
    : undefined;

  return {
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    textTransform: textCase === 'uppercase' ? 'uppercase' : 'none',
    color,
  };
}

export function typographyToStyle(t: AnnouncementBlockTypography): CSSProperties {
  return {
    fontFamily: t.fontFamily,
    fontSize: t.fontSize,
    fontWeight: t.fontWeight,
    letterSpacing: t.letterSpacing,
    textTransform: t.textTransform,
    ...(t.color ? { color: t.color } : null),
  };
}
