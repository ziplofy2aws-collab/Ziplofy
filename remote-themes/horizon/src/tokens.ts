import type { CSSProperties } from 'react';
import { getThemeConfigValue, useThemeConfig } from '@render-store/sdk';

export function useThemeColors() {
  const config = useThemeConfig();
  const primary = String(getThemeConfigValue(config, 'settings.colors.primary') ?? '#141414');
  const background = String(getThemeConfigValue(config, 'settings.colors.background') ?? '#faf9f7');
  const text = String(getThemeConfigValue(config, 'settings.colors.text') ?? '#141414');
  const muted = 'rgba(20, 20, 20, 0.58)';
  const surface = '#f0eeea';
  const fontHeading = String(
    getThemeConfigValue(config, 'settings.typography.fontFamily') ?? "'Cormorant Garamond', Georgia, serif"
  );
  const fontBody = String(
    getThemeConfigValue(config, 'settings.typography.fontFamilyBody') ?? "'DM Sans', system-ui, sans-serif"
  );
  return { primary, background, text, muted, surface, fontHeading, fontBody };
}

export const layout = {
  maxWidth: 1280,
  padX: 24,
  line: 'rgba(20, 20, 20, 0.1)',
} as const;

export const inputStyle: CSSProperties = {
  fontSize: 15,
  padding: '12px 14px',
  border: `1px solid ${layout.line}`,
  borderRadius: 2,
  width: '100%',
  boxSizing: 'border-box',
};
