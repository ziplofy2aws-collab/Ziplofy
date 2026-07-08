import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { getThemeConfigValue, useThemeConfig } from '@render-store/sdk';
import {
  readThemeSwatchesSettings,
  type ThemeSwatchesSettings,
} from '../../settings/theme-swatches.settings';

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

export function resolveThemeSwatchBorderCss(
  config: Record<string, unknown> | null | undefined,
  settings: ThemeSwatchesSettings
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

export function themeSwatchesCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = readThemeSwatchesSettings(config);
  return {
    '--codiic-swatch-width': `${settings.width}px`,
    '--codiic-swatch-height': `${settings.height}px`,
    '--codiic-swatch-radius': `${settings.cornerRadius}px`,
    '--codiic-swatch-border': resolveThemeSwatchBorderCss(config, settings),
  };
}

export function resolveThemeSwatchInlineStyle(
  config: Record<string, unknown> | null | undefined
): CSSProperties {
  const settings = readThemeSwatchesSettings(config);
  return {
    width: settings.width,
    height: settings.height,
    borderRadius: settings.cornerRadius,
    border: resolveThemeSwatchBorderCss(config, settings),
    boxSizing: 'border-box',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
}

export function useThemeSwatches(): ThemeSwatchesSettings {
  const config = useThemeConfig();
  return useMemo(() => readThemeSwatchesSettings(config), [config]);
}

export function useThemeSwatchInlineStyle(): CSSProperties {
  const config = useThemeConfig();
  return useMemo(() => resolveThemeSwatchInlineStyle(config), [config]);
}

export type { ThemeSwatchesSettings };
