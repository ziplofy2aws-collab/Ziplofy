import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  readThemeVariantPickersSettings,
  resolveThemeVariantPickerColors,
  type ResolvedThemeVariantPickerColors,
  type ThemeVariantPickersSettings,
} from '../../settings/theme-variant-pickers.settings';

export function themeVariantPickersCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const pickers = resolveThemeVariantPickerColors(config);
  return {
    '--ziplofy-variant-picker-bg': pickers.variantBackgroundResolved,
    '--ziplofy-variant-picker-text': pickers.variantTextResolved,
    '--ziplofy-variant-picker-border': pickers.variantBorderResolved,
    '--ziplofy-variant-picker-border-width': `${pickers.borderThickness}px`,
    '--ziplofy-variant-picker-radius': `${pickers.cornerRadius}px`,
    '--ziplofy-variant-picker-selected-bg': pickers.selectedBackgroundResolved,
    '--ziplofy-variant-picker-selected-text': pickers.selectedTextResolved,
    '--ziplofy-variant-picker-selected-border': pickers.selectedBorderResolved,
  };
}

export function resolveThemeVariantPickerOptionStyle(
  config: Record<string, unknown> | null | undefined,
  selected: boolean
): CSSProperties {
  const pickers = resolveThemeVariantPickerColors(config);
  const borderThickness = pickers.borderThickness;

  if (selected) {
    return {
      background: pickers.selectedBackgroundResolved,
      color: pickers.selectedTextResolved,
      border:
        borderThickness > 0
          ? `${borderThickness}px solid ${pickers.selectedBorderResolved}`
          : 'none',
      borderRadius: pickers.cornerRadius,
      width: pickers.width === 'fill' ? '100%' : undefined,
      minWidth: pickers.width === 'fit' ? 44 : undefined,
      boxSizing: 'border-box',
    };
  }

  return {
    background: pickers.variantBackgroundResolved,
    color: pickers.variantTextResolved,
    border:
      borderThickness > 0
        ? `${borderThickness}px solid ${pickers.variantBorderResolved}`
        : 'none',
    borderRadius: pickers.cornerRadius,
    width: pickers.width === 'fill' ? '100%' : undefined,
    minWidth: pickers.width === 'fit' ? 44 : undefined,
    boxSizing: 'border-box',
  };
}

export function useThemeVariantPickers(): ThemeVariantPickersSettings {
  const config = useThemeConfig();
  return useMemo(() => readThemeVariantPickersSettings(config), [config]);
}

export function useThemeVariantPickerColors(): ResolvedThemeVariantPickerColors {
  const config = useThemeConfig();
  return useMemo(() => resolveThemeVariantPickerColors(config), [config]);
}

export function useThemeVariantPickerOptionStyle(selected: boolean): CSSProperties {
  const config = useThemeConfig();
  return useMemo(
    () => resolveThemeVariantPickerOptionStyle(config, selected),
    [config, selected]
  );
}

export type { ResolvedThemeVariantPickerColors, ThemeVariantPickersSettings };
