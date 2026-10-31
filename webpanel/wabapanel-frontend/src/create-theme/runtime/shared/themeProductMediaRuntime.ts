import { useMemo } from 'react';
import { getThemeConfigValue, useThemeConfig } from '@render-store/sdk';
import {
  readThemeProductMediaSettings,
  type ThemeProductMediaSettings,
} from '../../settings/theme-product-media.settings';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
  }
  return null;
}

function borderColorWithOpacity(baseColor: string, opacityPercent: number): string {
  const rgb = hexToRgb(baseColor);
  const alpha = Math.min(100, Math.max(0, opacityPercent)) / 100;
  if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  return `rgba(17, 24, 39, ${alpha})`;
}

export function resolveThemeProductMediaBorderCss(
  config: Record<string, unknown> | null | undefined,
  settings: ThemeProductMediaSettings
): string {
  if (settings.borderStyle !== 'solid' || settings.borderThickness <= 0) return 'none';
  const base =
    String(getThemeConfigValue(config, 'settings.colors.text') ?? '') ||
    String(getThemeConfigValue(config, 'settings.colors.border') ?? '#111827');
  const color = borderColorWithOpacity(
    base.startsWith('#') ? base : '#111827',
    settings.borderOpacity
  );
  return `${settings.borderThickness}px solid ${color}`;
}

export function themeProductMediaCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = readThemeProductMediaSettings(config);
  return {
    '--codiic-product-media-radius': `${settings.cornerRadius}px`,
    '--codiic-product-media-border': resolveThemeProductMediaBorderCss(config, settings),
  };
}

export function useThemeProductMedia(): ThemeProductMediaSettings {
  const config = useThemeConfig();
  return useMemo(() => readThemeProductMediaSettings(config), [config]);
}

export type { ThemeProductMediaSettings };
