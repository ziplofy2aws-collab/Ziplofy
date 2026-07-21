import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import { readBoolSetting } from './theme-animations.settings';

export const THEME_PRICES_CURRENCY_PRODUCT_PAGES_PATH =
  'settings.prices.currencyCode.productPages';
export const THEME_PRICES_CURRENCY_PRODUCT_CARDS_PATH =
  'settings.prices.currencyCode.productCards';
export const THEME_PRICES_CURRENCY_CART_ITEMS_PATH = 'settings.prices.currencyCode.cartItems';
export const THEME_PRICES_CURRENCY_CART_TOTAL_PATH = 'settings.prices.currencyCode.cartTotal';

export type ThemePriceCurrencyContext =
  | 'productPages'
  | 'productCards'
  | 'cartItems'
  | 'cartTotal';

export const THEME_DEFAULT_PRICES = {
  currencyCode: {
    productPages: true,
    productCards: true,
    cartItems: true,
    cartTotal: true,
  },
};

export type ThemePricesSettings = {
  currencyCode: {
    productPages: boolean;
    productCards: boolean;
    cartItems: boolean;
    cartTotal: boolean;
  };
};

function readPricesSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const prices = settings?.prices;
  return prices && typeof prices === 'object' ? (prices as Record<string, unknown>) : {};
}

function readCurrencyCodeSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const prices = readPricesSettings(config);
  const currencyCode = prices.currencyCode;
  return currencyCode && typeof currencyCode === 'object'
    ? (currencyCode as Record<string, unknown>)
    : {};
}

export function readThemePricesSettings(
  config: Record<string, unknown> | null | undefined
): ThemePricesSettings {
  const currencyCode = readCurrencyCodeSettings(config);

  return {
    currencyCode: {
      productPages: readBoolSetting(
        currencyCode.productPages,
        THEME_DEFAULT_PRICES.currencyCode.productPages
      ),
      productCards: readBoolSetting(
        currencyCode.productCards,
        THEME_DEFAULT_PRICES.currencyCode.productCards
      ),
      cartItems: readBoolSetting(
        currencyCode.cartItems,
        THEME_DEFAULT_PRICES.currencyCode.cartItems
      ),
      cartTotal: readBoolSetting(
        currencyCode.cartTotal,
        THEME_DEFAULT_PRICES.currencyCode.cartTotal
      ),
    },
  };
}

export function shouldShowThemePriceCurrencyCode(
  config: Record<string, unknown> | null | undefined,
  context: ThemePriceCurrencyContext
): boolean {
  return readThemePricesSettings(config).currencyCode[context];
}

export function seedThemePricesValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const prices = readThemePricesSettings(config);
  return {
    ...values,
    [THEME_PRICES_CURRENCY_PRODUCT_PAGES_PATH]: prices.currencyCode.productPages,
    [THEME_PRICES_CURRENCY_PRODUCT_CARDS_PATH]: prices.currencyCode.productCards,
    [THEME_PRICES_CURRENCY_CART_ITEMS_PATH]: prices.currencyCode.cartItems,
    [THEME_PRICES_CURRENCY_CART_TOTAL_PATH]: prices.currencyCode.cartTotal,
  };
}

export function ensureThemePricesDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const prices = (settings.prices ?? {}) as Record<string, unknown>;
  const currencyCode = (prices.currencyCode ?? {}) as Record<string, unknown>;

  if (!settings.prices || typeof settings.prices !== 'object') {
    settings.prices = prices;
  }
  if (!prices.currencyCode || typeof prices.currencyCode !== 'object') {
    prices.currencyCode = currencyCode;
  }

  const resolved = readThemePricesSettings({ ...config, settings: { ...settings, prices } });

  currencyCode.productPages = resolved.currencyCode.productPages;
  currencyCode.productCards = resolved.currencyCode.productCards;
  currencyCode.cartItems = resolved.currencyCode.cartItems;
  currencyCode.cartTotal = resolved.currencyCode.cartTotal;

  prices.currencyCode = currencyCode;
  settings.prices = prices;
  config.settings = settings;
}

export const THEME_PRICES_SCHEMA_GROUP = {
  id: 'prices',
  label: 'Prices',
  fields: [
    { path: THEME_PRICES_CURRENCY_PRODUCT_PAGES_PATH, type: 'boolean', label: 'Product pages' },
    { path: THEME_PRICES_CURRENCY_PRODUCT_CARDS_PATH, type: 'boolean', label: 'Product cards' },
    { path: THEME_PRICES_CURRENCY_CART_ITEMS_PATH, type: 'boolean', label: 'Cart items' },
    { path: THEME_PRICES_CURRENCY_CART_TOTAL_PATH, type: 'boolean', label: 'Cart total' },
  ],
} as const;

export function withThemePricesSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'prices');
  const nextGroup = {
    id: THEME_PRICES_SCHEMA_GROUP.id,
    label: THEME_PRICES_SCHEMA_GROUP.label,
    fields: [...THEME_PRICES_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const popoversIndex = groups.findIndex((g) => g.id === 'popovers-modals');
    if (popoversIndex >= 0) {
      groups.splice(popoversIndex + 1, 0, nextGroup);
    } else {
      groups.push(nextGroup);
    }
  }

  return {
    ...schema,
    globalSettings: {
      label: schema.globalSettings?.label ?? 'Theme settings',
      groups,
    },
  };
}
