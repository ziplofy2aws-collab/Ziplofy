import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import { readBoolSetting } from './theme-animations.settings';
import {
  resolveThemePaletteColorSetting,
  themePaletteColorValue,
} from './theme-color-palette.settings';

export const THEME_PRODUCT_CARDS_QUICK_ADD_PATH = 'settings.productCards.quickAdd';
export const THEME_PRODUCT_CARDS_MOBILE_QUICK_ADD_PATH = 'settings.productCards.mobileQuickAdd';
export const THEME_PRODUCT_CARDS_BACKGROUND_COLOR_PATH = 'settings.productCards.backgroundColor';
export const THEME_PRODUCT_CARDS_TEXT_COLOR_PATH = 'settings.productCards.textColor';

export const THEME_DEFAULT_PRODUCT_CARDS = {
  quickAdd: true,
  mobileQuickAdd: false,
  backgroundColor: 'palette',
  textColor: themePaletteColorValue(1),
};

export type ThemeProductCardsSettings = {
  quickAdd: boolean;
  mobileQuickAdd: boolean;
  backgroundColor: string;
  textColor: string;
};

function readProductCardsSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const productCards = settings?.productCards;
  return productCards && typeof productCards === 'object'
    ? (productCards as Record<string, unknown>)
    : {};
}

export function readThemeProductCardsSettings(
  config: Record<string, unknown> | null | undefined
): ThemeProductCardsSettings {
  const productCards = readProductCardsSettings(config);

  return {
    quickAdd: readBoolSetting(productCards.quickAdd, THEME_DEFAULT_PRODUCT_CARDS.quickAdd),
    mobileQuickAdd: readBoolSetting(
      productCards.mobileQuickAdd,
      THEME_DEFAULT_PRODUCT_CARDS.mobileQuickAdd
    ),
    backgroundColor:
      typeof productCards.backgroundColor === 'string' && productCards.backgroundColor.trim()
        ? productCards.backgroundColor
        : THEME_DEFAULT_PRODUCT_CARDS.backgroundColor,
    textColor:
      typeof productCards.textColor === 'string' && productCards.textColor.trim()
        ? productCards.textColor
        : THEME_DEFAULT_PRODUCT_CARDS.textColor,
  };
}

export function resolveThemeProductCardColors(
  config: Record<string, unknown> | null | undefined
): ThemeProductCardsSettings & {
  backgroundColorResolved: string;
  textColorResolved: string;
} {
  const productCards = readThemeProductCardsSettings(config);
  return {
    ...productCards,
    backgroundColorResolved: resolveThemePaletteColorSetting(
      config,
      productCards.backgroundColor,
      0,
      '#ffffff'
    ),
    textColorResolved: resolveThemePaletteColorSetting(
      config,
      productCards.textColor,
      1,
      '#111827'
    ),
  };
}

export function readThemeProductCardsSettingsFromValues(
  values: Record<string, string | boolean>
): ThemeProductCardsSettings {
  return {
    quickAdd: readBoolSetting(
      values[THEME_PRODUCT_CARDS_QUICK_ADD_PATH],
      THEME_DEFAULT_PRODUCT_CARDS.quickAdd
    ),
    mobileQuickAdd: readBoolSetting(
      values[THEME_PRODUCT_CARDS_MOBILE_QUICK_ADD_PATH],
      THEME_DEFAULT_PRODUCT_CARDS.mobileQuickAdd
    ),
    backgroundColor:
      typeof values[THEME_PRODUCT_CARDS_BACKGROUND_COLOR_PATH] === 'string' &&
      String(values[THEME_PRODUCT_CARDS_BACKGROUND_COLOR_PATH]).trim()
        ? String(values[THEME_PRODUCT_CARDS_BACKGROUND_COLOR_PATH])
        : THEME_DEFAULT_PRODUCT_CARDS.backgroundColor,
    textColor:
      typeof values[THEME_PRODUCT_CARDS_TEXT_COLOR_PATH] === 'string' &&
      String(values[THEME_PRODUCT_CARDS_TEXT_COLOR_PATH]).trim()
        ? String(values[THEME_PRODUCT_CARDS_TEXT_COLOR_PATH])
        : THEME_DEFAULT_PRODUCT_CARDS.textColor,
  };
}

export function seedThemeProductCardsValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const productCards = readThemeProductCardsSettings(config);
  return {
    ...values,
    [THEME_PRODUCT_CARDS_QUICK_ADD_PATH]: productCards.quickAdd,
    [THEME_PRODUCT_CARDS_MOBILE_QUICK_ADD_PATH]: productCards.mobileQuickAdd,
    [THEME_PRODUCT_CARDS_BACKGROUND_COLOR_PATH]: productCards.backgroundColor,
    [THEME_PRODUCT_CARDS_TEXT_COLOR_PATH]: productCards.textColor,
  };
}

export function ensureThemeProductCardsDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const productCards = (settings.productCards ?? {}) as Record<string, unknown>;

  if (!settings.productCards || typeof settings.productCards !== 'object') {
    settings.productCards = productCards;
  }

  const resolved = readThemeProductCardsSettings({
    ...config,
    settings: { ...settings, productCards },
  });

  productCards.quickAdd = resolved.quickAdd;
  productCards.mobileQuickAdd = resolved.mobileQuickAdd;
  productCards.backgroundColor = resolved.backgroundColor;
  productCards.textColor = resolved.textColor;

  settings.productCards = productCards;
  config.settings = settings;
}

export const THEME_PRODUCT_CARDS_SCHEMA_GROUP = {
  id: 'product-cards',
  label: 'Product cards',
  fields: [
    { path: THEME_PRODUCT_CARDS_QUICK_ADD_PATH, type: 'boolean', label: 'Quick add' },
    {
      path: THEME_PRODUCT_CARDS_MOBILE_QUICK_ADD_PATH,
      type: 'boolean',
      label: 'Mobile quick add',
    },
    {
      path: THEME_PRODUCT_CARDS_BACKGROUND_COLOR_PATH,
      type: 'text',
      label: 'Background',
    },
    { path: THEME_PRODUCT_CARDS_TEXT_COLOR_PATH, type: 'text', label: 'Text' },
  ],
} as const;

export function withThemeProductCardsSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'product-cards');
  const nextGroup = {
    id: THEME_PRODUCT_CARDS_SCHEMA_GROUP.id,
    label: THEME_PRODUCT_CARDS_SCHEMA_GROUP.label,
    fields: [...THEME_PRODUCT_CARDS_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const pricesIndex = groups.findIndex((g) => g.id === 'prices');
    if (pricesIndex >= 0) {
      groups.splice(pricesIndex + 1, 0, nextGroup);
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
