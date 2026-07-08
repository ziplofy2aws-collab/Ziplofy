import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  readThemeProductCardsSettings,
  resolveThemeProductCardColors,
  type ThemeProductCardsSettings,
} from '../../settings/theme-product-cards.settings';

export function themeProductCardsCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const productCards = resolveThemeProductCardColors(config);
  return {
    '--codiic-product-card-bg': productCards.backgroundColorResolved,
    '--codiic-product-card-text': productCards.textColorResolved,
  };
}

export function resolveThemeProductCardInlineStyle(
  config: Record<string, unknown> | null | undefined
): CSSProperties {
  const productCards = resolveThemeProductCardColors(config);
  return {
    background: productCards.backgroundColorResolved,
    color: productCards.textColorResolved,
  };
}

export function useThemeProductCards(): ThemeProductCardsSettings & {
  backgroundColorResolved: string;
  textColorResolved: string;
} {
  const config = useThemeConfig();
  return useMemo(() => resolveThemeProductCardColors(config), [config]);
}

export function useThemeProductCardInlineStyle(): CSSProperties {
  const config = useThemeConfig();
  return useMemo(() => resolveThemeProductCardInlineStyle(config), [config]);
}

export function readThemeProductCardsQuickAddFlags(
  config: Record<string, unknown> | null | undefined
): Pick<ThemeProductCardsSettings, 'quickAdd' | 'mobileQuickAdd'> {
  const { quickAdd, mobileQuickAdd } = readThemeProductCardsSettings(config);
  return { quickAdd, mobileQuickAdd };
}

export type { ThemeProductCardsSettings };
