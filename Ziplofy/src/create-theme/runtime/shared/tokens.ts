import { useMemo, type CSSProperties } from 'react';
import { getThemeConfigValue, useThemeConfig } from '@render-store/sdk';
import { resolveThemePageBackgroundColor, resolveThemePageMaxWidth } from '../../settings/theme-page.settings';
import {
  resolveThemeTypographyFonts,
  resolveThemeTypographyTextColor,
} from '../../settings/theme-typography.settings';
import { themeFontsFromConfig } from './themeTypographyRuntime';

export function useThemeColors() {
  const config = useThemeConfig();
  const primary = String(getThemeConfigValue(config, 'settings.colors.primary') ?? '#111827');
  const background = resolveThemePageBackgroundColor(config);
  const text = resolveThemeTypographyTextColor(config);
  const accent = String(getThemeConfigValue(config, 'settings.colors.accent') ?? primary);
  const surface = String(getThemeConfigValue(config, 'settings.colors.surface') ?? background);
  const muted = String(getThemeConfigValue(config, 'settings.colors.muted') ?? '#6b7280');
  const border = String(getThemeConfigValue(config, 'settings.colors.border') ?? '#e5e7eb');
  const link = accent;
  const fonts = resolveThemeTypographyFonts(config);
  const fontHeading = fonts.fontHeading;
  const fontBody = fonts.fontBody;
  const fontSubheading = fonts.fontSubheading;
  const fontAccent = fonts.fontAccent;
  return {
    primary,
    background,
    text,
    accent,
    link,
    surface,
    muted,
    border,
    fontHeading,
    fontBody,
    fontSubheading,
    fontAccent,
  };
}

export function useThemeFonts() {
  const config = useThemeConfig();
  return themeFontsFromConfig(config);
}

export function useThemeLayout() {
  const config = useThemeConfig();
  return useMemo(
    () => ({
      maxWidth: resolveThemePageMaxWidth(config),
      padX: layout.padX,
      padXMobile: layout.padXMobile,
      line: layout.line,
    }),
    [config]
  );
}

export const layout = {
  maxWidth: 1200,
  padX: 24,
  /** Horizontal padding on viewports ≤749px (Shopify mobile preview). */
  padXMobile: 16,
  line: 'rgba(17, 24, 39, 0.12)',
} as const;

export const inputStyle: CSSProperties = {
  fontSize: 15,
  padding: '12px 14px',
  border: `1px solid ${layout.line}`,
  borderRadius: 8,
  width: '100%',
  boxSizing: 'border-box',
};
