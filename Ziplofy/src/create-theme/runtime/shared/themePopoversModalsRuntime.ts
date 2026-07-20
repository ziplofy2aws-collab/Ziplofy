import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  resolveThemePopoversModalsColors,
  type ThemePopoversModalsSettings,
} from '../../settings/theme-popovers-modals.settings';

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

function shadowFromColor(hex: string): string {
  const rgb = hexToRgb(hex.startsWith('#') ? hex : '#111827');
  if (rgb) return `0 12px 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
  return '0 12px 40px rgba(0, 0, 0, 0.14)';
}

export function resolveThemePopoverModalBoxShadow(
  settings: ThemePopoversModalsSettings & { shadowColorResolved: string }
): string {
  if (!settings.dropShadow) return 'none';
  return shadowFromColor(settings.shadowColorResolved);
}

export function themePopoversModalsCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const settings = resolveThemePopoversModalsColors(config);
  return {
    '--codiic-popover-bg': settings.backgroundColorResolved,
    '--codiic-popover-text': settings.textColorResolved,
    '--codiic-popover-radius': `${settings.cornerRadius}px`,
    '--codiic-popover-border': settings.borderColorResolved,
    '--codiic-popover-border-width': `${settings.borderThickness}px`,
    '--codiic-popover-shadow': resolveThemePopoverModalBoxShadow(settings),
  };
}

export function resolveThemePopoverModalInlineStyle(
  config: Record<string, unknown> | null | undefined
): CSSProperties {
  const settings = resolveThemePopoversModalsColors(config);
  return {
    background: settings.backgroundColorResolved,
    color: settings.textColorResolved,
    borderRadius: settings.cornerRadius,
    border: `${settings.borderThickness}px solid ${settings.borderColorResolved}`,
    boxShadow: resolveThemePopoverModalBoxShadow(settings),
  };
}

export function useThemePopoversModals(): ThemePopoversModalsSettings & {
  backgroundColorResolved: string;
  textColorResolved: string;
  borderColorResolved: string;
  shadowColorResolved: string;
} {
  const config = useThemeConfig();
  return useMemo(() => resolveThemePopoversModalsColors(config), [config]);
}

export function useThemePopoverModalInlineStyle(): CSSProperties {
  const config = useThemeConfig();
  return useMemo(() => resolveThemePopoverModalInlineStyle(config), [config]);
}

export type { ThemePopoversModalsSettings };
