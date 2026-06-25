import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  resolveThemeInputFieldColors,
  themeInputFieldsTextPresetId,
  type ThemeInputFieldsSettings,
} from '../../settings/theme-input-fields.settings';
import {
  resolveThemeTypographyStyle,
  themeFontsFromConfig,
} from './themeTypographyRuntime';

export function themeInputFieldsCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const fields = resolveThemeInputFieldColors(config);
  const fonts = themeFontsFromConfig(config);
  const typo = resolveThemeTypographyStyle(config, fields.textPreset, fonts);

  return {
    '--ziplofy-input-bg': fields.backgroundColorResolved,
    '--ziplofy-input-text': fields.textColorResolved,
    '--ziplofy-input-border': fields.borderColorResolved,
    '--ziplofy-input-border-width': `${fields.borderThickness}px`,
    '--ziplofy-input-radius': `${fields.cornerRadius}px`,
    '--ziplofy-input-font-family': typo.fontFamily,
    '--ziplofy-input-font-size': `${typo.fontSize}px`,
    '--ziplofy-input-font-weight': String(typo.fontWeight),
    '--ziplofy-input-line-height': String(typo.lineHeight),
    '--ziplofy-input-letter-spacing': typo.letterSpacing,
    '--ziplofy-input-text-transform': typo.textTransform ?? 'none',
  };
}

export function resolveThemeInputFieldInlineStyle(
  config: Record<string, unknown> | null | undefined
): CSSProperties {
  const fields = resolveThemeInputFieldColors(config);
  const fonts = themeFontsFromConfig(config);
  const typo = resolveThemeTypographyStyle(
    config,
    themeInputFieldsTextPresetId(fields.textPreset),
    fonts
  );

  return {
    color: fields.textColorResolved,
    background: fields.backgroundColorResolved,
    border: `${fields.borderThickness}px solid ${fields.borderColorResolved}`,
    borderRadius: fields.cornerRadius,
    fontFamily: typo.fontFamily,
    fontSize: typo.fontSize,
    fontWeight: typo.fontWeight,
    fontStyle: typo.fontStyle,
    lineHeight: typo.lineHeight,
    letterSpacing: typo.letterSpacing,
    textTransform: typo.textTransform,
  };
}

export function useThemeInputFields(): ThemeInputFieldsSettings & {
  backgroundColorResolved: string;
  textColorResolved: string;
  borderColorResolved: string;
} {
  const config = useThemeConfig();
  return useMemo(() => resolveThemeInputFieldColors(config), [config]);
}

export function useThemeInputFieldInlineStyle(): CSSProperties {
  const config = useThemeConfig();
  return useMemo(() => resolveThemeInputFieldInlineStyle(config), [config]);
}

export type { ThemeInputFieldsSettings };
