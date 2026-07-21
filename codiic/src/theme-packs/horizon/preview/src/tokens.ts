import type { CSSProperties } from 'react';
import { getThemeConfigValue, useThemeConfig } from '@render-store/sdk';

export function useThemeColors() {
  const config = useThemeConfig();
  const primary = String(getThemeConfigValue(config, 'settings.colors.primary') ?? '#111827');
  const background = String(getThemeConfigValue(config, 'settings.colors.background') ?? '#ffffff');
  const text = String(getThemeConfigValue(config, 'settings.colors.text') ?? '#111827');
  const accent = String(getThemeConfigValue(config, 'settings.colors.accent') ?? primary);
  const link = accent;
  const fontHeading = String(
    getThemeConfigValue(config, 'settings.typography.fontFamily') ?? "Georgia, serif"
  );
  const fontBody = String(
    getThemeConfigValue(config, 'settings.typography.fontFamilyBody') ?? 'system-ui, sans-serif'
  );
  return { primary, background, text, accent, link, fontHeading, fontBody };
}

export const layout = {
  maxWidth: 1200,
  padX: 24,
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
