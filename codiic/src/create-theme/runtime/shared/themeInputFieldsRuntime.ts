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
    '--codiic-input-bg': fields.backgroundColorResolved,
    '--codiic-input-text': fields.textColorResolved,
    '--codiic-input-border': fields.borderColorResolved,
    '--codiic-input-border-width': `${fields.borderThickness}px`,
    '--codiic-input-radius': `${fields.cornerRadius}px`,
    '--codiic-input-font-family': typo.fontFamily,
    '--codiic-input-font-size': `${typo.fontSize}px`,
    '--codiic-input-font-weight': String(typo.fontWeight),
    '--codiic-input-line-height': String(typo.lineHeight),
    '--codiic-input-letter-spacing': typo.letterSpacing,
    '--codiic-input-text-transform': typo.textTransform ?? 'none',
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
