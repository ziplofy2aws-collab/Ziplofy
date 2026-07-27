import { useMemo } from 'react';
import { formatMoney, useThemeConfig } from '@render-store/sdk';
import {
  readThemePricesSettings,
  shouldShowThemePriceCurrencyCode,
  type ThemePriceCurrencyContext,
  type ThemePricesSettings,
} from '../../settings/theme-prices.settings';

export const THEME_PREVIEW_CURRENCY_CODE = 'INR';

export function formatThemePrice(
  config: Record<string, unknown> | null | undefined,
  amountInPaisa: number,
  context: ThemePriceCurrencyContext,
  currencyCode: string = THEME_PREVIEW_CURRENCY_CODE
): string {
  const formatted = formatMoney(amountInPaisa, currencyCode);
  if (!shouldShowThemePriceCurrencyCode(config, context)) return formatted;
  return `${formatted} ${currencyCode}`;
}

export function useThemePrices(): ThemePricesSettings {
  const config = useThemeConfig();
  return useMemo(() => readThemePricesSettings(config), [config]);
}

export function useFormatThemePrice(
  context: ThemePriceCurrencyContext,
  currencyCode: string = THEME_PREVIEW_CURRENCY_CODE
): (amountInPaisa: number) => string {
  const config = useThemeConfig();
  return useMemo(
    () => (amountInPaisa: number) => formatThemePrice(config, amountInPaisa, context, currencyCode),
    [config, context, currencyCode]
  );
}

export type { ThemePriceCurrencyContext, ThemePricesSettings };
