import { useMemo } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  readThemeIconsSettings,
  resolveThemeIconStrokeWidth,
  type ThemeIconsSettings,
} from '../../settings/theme-icons.settings';

export function themeIconCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const icons = readThemeIconsSettings(config);
  return {
    '--ziplofy-icon-stroke-width': String(resolveThemeIconStrokeWidth(icons.stroke)),
  };
}

export function useThemeIconStrokeWidth(): number {
  const config = useThemeConfig();
  return useMemo(() => {
    const icons = readThemeIconsSettings(config);
    return resolveThemeIconStrokeWidth(icons.stroke);
  }, [config]);
}

export function useThemeIcons(): ThemeIconsSettings {
  const config = useThemeConfig();
  return useMemo(() => readThemeIconsSettings(config), [config]);
}

export type { ThemeIconsSettings };
