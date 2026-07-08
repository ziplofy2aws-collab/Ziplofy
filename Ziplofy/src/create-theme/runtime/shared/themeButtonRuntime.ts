import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  readThemeButtonsSettings,
  resolveThemeButtonBackgroundColor,
  resolveThemeButtonBorderColor,
  resolveThemeButtonTextColor,
  type ThemeButtonVariant,
  type ThemeButtonVariantSettings,
} from '../../settings/theme-buttons.settings';
import {
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  themeFontsFromConfig,
} from './themeTypographyRuntime';

export type ResolvedThemeButtonVariantStyle = {
  background: string;
  color: string;
  border: string;
  borderRadius: number;
  fontFamily: string;
  fontWeight: CSSProperties['fontWeight'];
  fontStyle: CSSProperties['fontStyle'];
  textTransform: CSSProperties['textTransform'];
};

export function resolveThemeButtonVariantStyle(
  config: Record<string, unknown> | null | undefined,
  variant: ThemeButtonVariant
): ResolvedThemeButtonVariantStyle {
  const buttons = readThemeButtonsSettings(config);
  const settings: ThemeButtonVariantSettings = buttons[variant];
  const fonts = themeFontsFromConfig(config);
  const fontFamily = resolveThemeFontFamily(settings.font, fonts);
  const fontTraits = resolveThemeFontWeightAndStyle(settings.font);
  const borderColor = resolveThemeButtonBorderColor(config, settings.border, 1, '#111827');
  const borderThickness = settings.borderThickness;

  return {
    background: resolveThemeButtonBackgroundColor(config, settings.background, 1, '#111827'),
    color: resolveThemeButtonTextColor(config, settings.text, 0, '#ffffff'),
    border:
      borderThickness > 0 ? `${borderThickness}px solid ${borderColor}` : 'none',
    borderRadius: settings.cornerRadius,
    fontFamily,
    fontWeight: fontTraits.fontWeight ?? 400,
    fontStyle: fontTraits.fontStyle ?? 'normal',
    textTransform: settings.textCase === 'uppercase' ? 'uppercase' : 'none',
  };
}

export function themeButtonCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const buttons = readThemeButtonsSettings(config);
  const primary = resolveThemeButtonVariantStyle(config, 'primary');
  const secondary = resolveThemeButtonVariantStyle(config, 'secondary');
  const primaryBorderColor = resolveThemeButtonBorderColor(
    config,
    buttons.primary.border,
    1,
    '#111827'
  );
  const secondaryBorderColor = resolveThemeButtonBorderColor(
    config,
    buttons.secondary.border,
    1,
    '#111827'
  );

  return {
    '--codiic-btn-primary-bg': primary.background,
    '--codiic-btn-primary-text': primary.color,
    '--codiic-btn-primary-border-color': primaryBorderColor,
    '--codiic-btn-primary-border-width': `${buttons.primary.borderThickness}px`,
    '--codiic-btn-primary-radius': `${primary.borderRadius}px`,
    '--codiic-btn-primary-font-family': primary.fontFamily,
    '--codiic-btn-primary-font-weight': String(primary.fontWeight ?? 400),
    '--codiic-btn-primary-font-style': primary.fontStyle ?? 'normal',
    '--codiic-btn-primary-text-transform': primary.textTransform ?? 'none',
    '--codiic-btn-secondary-bg': secondary.background,
    '--codiic-btn-secondary-text': secondary.color,
    '--codiic-btn-secondary-border-color': secondaryBorderColor,
    '--codiic-btn-secondary-border-width': `${buttons.secondary.borderThickness}px`,
    '--codiic-btn-secondary-radius': `${secondary.borderRadius}px`,
    '--codiic-btn-secondary-font-family': secondary.fontFamily,
    '--codiic-btn-secondary-font-weight': String(secondary.fontWeight ?? 400),
    '--codiic-btn-secondary-font-style': secondary.fontStyle ?? 'normal',
    '--codiic-btn-secondary-text-transform': secondary.textTransform ?? 'none',
    '--codiic-pill-radius': `${buttons.pills.cornerRadius}px`,
  };
}

export function useThemeButtons() {
  const config = useThemeConfig();
  return useMemo(
    () => ({
      primary: resolveThemeButtonVariantStyle(config, 'primary'),
      secondary: resolveThemeButtonVariantStyle(config, 'secondary'),
      pillsRadius: readThemeButtonsSettings(config).pills.cornerRadius,
    }),
    [config]
  );
}

export function themeButtonInlineStyle(
  style: ResolvedThemeButtonVariantStyle
): CSSProperties {
  return {
    background: style.background,
    color: style.color,
    border: style.border,
    borderRadius: style.borderRadius,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textTransform: style.textTransform,
  };
}
