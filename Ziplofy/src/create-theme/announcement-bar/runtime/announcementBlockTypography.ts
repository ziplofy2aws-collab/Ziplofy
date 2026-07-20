import type { CSSProperties } from 'react';
import { cfgString } from '../../runtime/shared/config';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import {
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  type ThemeFonts,
} from '../../runtime/shared/themeTypographyRuntime';

export type AnnouncementBlockTypography = {
  fontFamily: string;
  fontSize: string | undefined;
  fontWeight: number | undefined;
  fontStyle: CSSProperties['fontStyle'] | undefined;
  letterSpacing: string;
  textTransform: CSSProperties['textTransform'];
  color: string | undefined;
};

export function readAnnouncementBlockTypography(
  config: Record<string, unknown> | null,
  blockSettingsBase: string,
  themeFonts: ThemeFonts
): AnnouncementBlockTypography {
  const font = cfgString(config, `${blockSettingsBase}.font`, 'subheading') || 'subheading';
  const fontSizeKey = cfgString(config, `${blockSettingsBase}.fontSize`, '12px');
  const fontSize = !fontSizeKey || fontSizeKey === 'default' ? undefined : fontSizeKey;
  const weightKey = cfgString(config, `${blockSettingsBase}.fontWeight`, 'default');
  const letterSpacingKey = cfgString(config, `${blockSettingsBase}.letterSpacing`);
  const textCase = cfgString(config, `${blockSettingsBase}.textCase`, 'default');
  const textColorRaw = cfgString(config, `${blockSettingsBase}.textColor`, '').trim();

  const fontFamily = resolveThemeFontFamily(font, themeFonts);
  const roleStyle = resolveThemeFontWeightAndStyle(font);

  const letterSpacing =
    letterSpacingKey === 'tight' ? '-0.02em' : letterSpacingKey === 'wide' ? '0.08em' : 'normal';

  const explicitWeight =
    weightKey === 'default' || weightKey === ''
      ? undefined
      : Number.isFinite(Number(weightKey))
        ? Number(weightKey)
        : undefined;

  const color = textColorRaw
    ? resolveThemePaletteColorSetting(config, textColorRaw, 1, '#111827')
    : undefined;

  return {
    fontFamily,
    fontSize,
    fontWeight: explicitWeight ?? roleStyle.fontWeight,
    fontStyle: explicitWeight != null ? undefined : roleStyle.fontStyle,
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
    fontStyle: t.fontStyle,
    letterSpacing: t.letterSpacing,
    textTransform: t.textTransform,
    ...(t.color ? { color: t.color } : null),
  };
}
