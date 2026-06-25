import { useMemo } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  readThemeCartSettings,
  type ThemeCartSettings,
} from '../../settings/theme-cart.settings';
import {
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  themeFontsFromConfig,
} from './themeTypographyRuntime';

export function resolveThemeCartPriceFontFamily(
  config: Record<string, unknown> | null | undefined
): string {
  const cart = readThemeCartSettings(config);
  const fonts = themeFontsFromConfig(config);
  return resolveThemeFontFamily(cart.priceFont, fonts);
}

export function resolveThemeCartPriceFontTraits(
  config: Record<string, unknown> | null | undefined
): { fontWeight: number | string; fontStyle: string } {
  const cart = readThemeCartSettings(config);
  const traits = resolveThemeFontWeightAndStyle(cart.priceFont);
  return {
    fontWeight: traits.fontWeight ?? 400,
    fontStyle: traits.fontStyle ?? 'normal',
  };
}

export function themeCartCssVars(
  config: Record<string, unknown> | null | undefined
): Record<string, string> {
  const cart = readThemeCartSettings(config);
  const priceFontFamily = resolveThemeCartPriceFontFamily(config);
  const priceTraits = resolveThemeCartPriceFontTraits(config);

  return {
    '--ziplofy-cart-price-font-family': priceFontFamily,
    '--ziplofy-cart-price-font-weight': String(priceTraits.fontWeight),
    '--ziplofy-cart-price-font-style': priceTraits.fontStyle,
    '--ziplofy-cart-product-title-transform':
      cart.productTitleCase === 'uppercase' ? 'uppercase' : 'none',
  };
}

export function useThemeCart(): ThemeCartSettings {
  const config = useThemeConfig();
  return useMemo(() => readThemeCartSettings(config), [config]);
}

export type { ThemeCartSettings };
