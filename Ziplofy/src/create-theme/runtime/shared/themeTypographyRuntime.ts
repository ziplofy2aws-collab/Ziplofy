import type { CSSProperties } from 'react';
import {
  readThemeTextPresets,
  resolveThemeTypographyFonts,
  type ThemeFontRole,
  type ThemeTextPreset,
  type ThemeTextPresetId,
} from '../../settings/theme-typography.settings';

export type ThemeFonts = {
  fontBody: string;
  fontHeading: string;
  fontSubheading?: string;
  fontAccent?: string;
};

const BLOCK_PRESET_TO_THEME: Record<string, ThemeTextPresetId> = {
  default: 'paragraph',
  paragraph: 'paragraph',
  body: 'paragraph',
  'heading-1': 'h1',
  'heading-2': 'h2',
  'heading-3': 'h3',
  'heading-4': 'h4',
  'heading-5': 'h5',
  'heading-6': 'h6',
};

export function lineHeightMultiplier(key: string): number {
  if (key === 'tight') return 1.1;
  if (key === 'loose') return 1.55;
  return 1.35;
}

export function letterSpacingCss(key: string): string {
  if (key === 'tight') return '-0.02em';
  if (key === 'loose') return '0.06em';
  return 'normal';
}

export function themeFontsFromConfig(config: Record<string, unknown> | null | undefined): ThemeFonts {
  const resolved = resolveThemeTypographyFonts(config);
  return {
    fontBody: resolved.fontBody,
    fontSubheading: resolved.fontSubheading,
    fontHeading: resolved.fontHeading,
    fontAccent: resolved.fontAccent,
  };
}

export function resolveThemeFontFamily(
  role: ThemeFontRole | 'heading' | 'accent' | string,
  fonts: ThemeFonts
): string {
  if (role === 'heading') return fonts.fontHeading;
  if (role === 'subheading') return fonts.fontSubheading ?? fonts.fontBody;
  if (role === 'accent') return fonts.fontAccent ?? fonts.fontBody;
  return fonts.fontBody;
}

export function resolveThemeFontWeightAndStyle(
  role: ThemeFontRole | 'heading' | 'accent' | string
): Pick<CSSProperties, 'fontWeight' | 'fontStyle'> {
  if (role === 'heading') return { fontWeight: 600 };
  if (role === 'subheading') return { fontWeight: 600 };
  if (role === 'accent') return { fontWeight: 400, fontStyle: 'italic' };
  return { fontWeight: 400 };
}

export function resolveThemeTextPreset(
  config: Record<string, unknown> | null | undefined,
  presetKey: string
): ThemeTextPreset {
  const presets = readThemeTextPresets(config);
  const themeId = BLOCK_PRESET_TO_THEME[presetKey] ?? 'paragraph';
  return presets[themeId] ?? presets.paragraph;
}

export type ResolvedThemeTypographyStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: CSSProperties['fontStyle'];
  lineHeight: number;
  letterSpacing: string;
  textTransform?: CSSProperties['textTransform'];
};

export function resolveThemeTypographyStyle(
  config: Record<string, unknown> | null | undefined,
  presetKey: string,
  fonts: ThemeFonts
): ResolvedThemeTypographyStyle {
  const preset = resolveThemeTextPreset(config, presetKey);
  const weightStyle = resolveThemeFontWeightAndStyle(preset.font);

  return {
    fontFamily: resolveThemeFontFamily(preset.font, fonts),
    fontSize: preset.size,
    fontWeight: weightStyle.fontWeight ?? 400,
    fontStyle: weightStyle.fontStyle,
    lineHeight: lineHeightMultiplier(preset.lineHeight),
    letterSpacing: letterSpacingCss(preset.letterSpacing),
    textTransform: preset.textCase === 'uppercase' ? 'uppercase' : 'none',
  };
}
