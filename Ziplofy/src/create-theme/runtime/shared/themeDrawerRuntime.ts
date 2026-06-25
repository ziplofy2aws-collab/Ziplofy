import { useMemo } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  resolveThemeDrawerColors,
  type ThemeDrawersSettings,
} from '../../settings/theme-drawers.settings';

export function themeDrawerCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const colors = resolveThemeDrawerColors(config);
  return {
    '--ziplofy-drawer-bg': colors.backgroundColorResolved,
    '--ziplofy-drawer-text': colors.textColorResolved,
    '--ziplofy-drawer-border': colors.borderColorResolved,
  };
}

export function useThemeDrawers(): ThemeDrawersSettings & {
  backgroundColorResolved: string;
  textColorResolved: string;
  borderColorResolved: string;
} {
  const config = useThemeConfig();
  return useMemo(() => resolveThemeDrawerColors(config), [config]);
}

export type { ThemeDrawersSettings };
