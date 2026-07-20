import type { CSSProperties } from 'react';
import { cfgString } from './config';

export type AnnouncementBlockTypography = {
  fontFamily: string;
  fontSize: string | undefined;
  fontWeight: number | undefined;
  fontStyle: CSSProperties['fontStyle'] | undefined;
  letterSpacing: string;
  textTransform: CSSProperties['textTransform'];
};

type ThemeFonts = {
  fontHeading: string;
  fontBody: string;
  fontSubheading?: string;
  fontAccent?: string;
};

function resolveFontFamily(font: string, themeFonts: ThemeFonts): string {
  if (font === 'heading') return themeFonts.fontHeading;
  if (font === 'accent') return themeFonts.fontAccent || themeFonts.fontBody;
  if (font === 'subheading') return themeFonts.fontSubheading || themeFonts.fontHeading || themeFonts.fontBody;
  return themeFonts.fontBody;
}

function resolveRoleWeight(font: string): { fontWeight?: number; fontStyle?: CSSProperties['fontStyle'] } {
  if (font === 'heading' || font === 'subheading') return { fontWeight: 600 };
  if (font === 'accent') return { fontWeight: 400, fontStyle: 'italic' };
  return { fontWeight: 400 };
}

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

  const roleStyle = resolveRoleWeight(font);
  const explicitWeight =
    weightKey === 'default' || weightKey === ''
      ? undefined
      : Number.isFinite(Number(weightKey))
        ? Number(weightKey)
        : undefined;

  const letterSpacing =
    letterSpacingKey === 'tight' ? '-0.02em' : letterSpacingKey === 'wide' ? '0.08em' : 'normal';

  return {
    fontFamily: resolveFontFamily(font, themeFonts),
    fontSize,
    fontWeight: explicitWeight ?? roleStyle.fontWeight,
    fontStyle: explicitWeight != null ? undefined : roleStyle.fontStyle,
    letterSpacing,
    textTransform: textCase === 'uppercase' ? 'uppercase' : 'none',
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
  };
}
