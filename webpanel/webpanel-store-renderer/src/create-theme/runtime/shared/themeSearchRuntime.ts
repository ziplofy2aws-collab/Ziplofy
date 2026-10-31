import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  readThemeSearchSettings,
  themeSearchTitleTextTransform,
  type ThemeSearchSettings,
} from '../../settings/theme-search.settings';

export function themeSearchCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const search = readThemeSearchSettings(config);
  return {
    '--codiic-search-product-radius': `${search.popover.productCornerRadius}px`,
    '--codiic-search-card-radius': `${search.popover.cardCornerRadius}px`,
    '--codiic-search-title-transform': themeSearchTitleTextTransform(search.popover.titleCase),
  };
}

export function resolveThemeSearchPopoverInlineStyle(
  config: Record<string, unknown> | null | undefined
): CSSProperties {
  const search = readThemeSearchSettings(config);
  return {
    borderRadius: search.popover.cardCornerRadius,
  };
}

export function resolveThemeSearchProductInlineStyle(
  config: Record<string, unknown> | null | undefined
): CSSProperties {
  const search = readThemeSearchSettings(config);
  return {
    borderRadius: search.popover.productCornerRadius,
    textTransform: themeSearchTitleTextTransform(search.popover.titleCase) as CSSProperties['textTransform'],
  };
}

export function useThemeSearch(): ThemeSearchSettings {
  const config = useThemeConfig();
  return useMemo(() => readThemeSearchSettings(config), [config]);
}

export function useThemeSearchCssVars(): Record<string, string> {
  const config = useThemeConfig();
  return useMemo(() => themeSearchCssVars(config), [config]);
}

export type { ThemeSearchSettings };
