import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import { readBoolSetting } from './theme-animations.settings';
import {
  THEME_FONT_ROLE_OPTIONS,
  THEME_TEXT_CASE_OPTIONS,
  type ThemeFontRole,
} from './theme-typography.settings';

export const THEME_CART_TYPE_PATH = 'settings.cart.type';
export const THEME_CART_PRODUCT_TITLE_CASE_PATH = 'settings.cart.productTitleCase';
export const THEME_CART_PRICE_FONT_PATH = 'settings.cart.priceFont';
export const THEME_CART_DRAWER_AUTO_OPEN_PATH = 'settings.cart.cartDrawerAutoOpen';
export const THEME_CART_ALLOW_NOTE_PATH = 'settings.cart.allowNoteToSeller';
export const THEME_CART_ALLOW_DISCOUNTS_PATH = 'settings.cart.allowDiscounts';
export const THEME_CART_INSTALLMENTS_PATH = 'settings.cart.installments';
export const THEME_CART_ACCELERATED_CHECKOUT_PATH = 'settings.cart.acceleratedCheckout';
export const THEME_CART_EMPTY_LINK_PATH = 'settings.cart.emptyCartLink';
export const THEME_CART_EMPTY_LINK_LABEL_PATH = 'settings.cart.emptyCartLinkLabel';

export const THEME_CART_HEADER_CART_TYPE_PATH = 'sections.header.settings.cartType';
export const THEME_CART_HEADER_PRODUCT_TITLE_CASE_PATH =
  'sections.header.settings.productTitleCase';
export const THEME_CART_HEADER_DRAWER_AUTO_OPEN_PATH =
  'sections.header.settings.cartDrawerAutoOpen';
export const THEME_CART_HEADER_EMPTY_LINK_PATH = 'sections.header.settings.emptyCartLink';

export const THEME_CART_TYPE_OPTIONS = [
  { value: 'page', label: 'Page' },
  { value: 'drawer', label: 'Drawer' },
] as const;

export type ThemeCartType = (typeof THEME_CART_TYPE_OPTIONS)[number]['value'];
export type ThemeCartTextCase = (typeof THEME_TEXT_CASE_OPTIONS)[number]['value'];

export const THEME_DEFAULT_CART = {
  type: 'page' as ThemeCartType,
  productTitleCase: 'default' as ThemeCartTextCase,
  priceFont: 'subheading' as ThemeFontRole,
  cartDrawerAutoOpen: false,
  allowNoteToSeller: false,
  allowDiscounts: true,
  installments: true,
  acceleratedCheckout: true,
  emptyCartLink: '/products',
  emptyCartLinkLabel: 'All Products',
};

export type ThemeCartSettings = {
  type: ThemeCartType;
  productTitleCase: ThemeCartTextCase;
  priceFont: ThemeFontRole;
  cartDrawerAutoOpen: boolean;
  allowNoteToSeller: boolean;
  allowDiscounts: boolean;
  installments: boolean;
  acceleratedCheckout: boolean;
  emptyCartLink: string;
  emptyCartLinkLabel: string;
};

function readCartSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const cart = settings?.cart;
  return cart && typeof cart === 'object' ? (cart as Record<string, unknown>) : {};
}

function readHeaderCartFallback(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const sections = config?.sections as Record<string, unknown> | undefined;
  const header = sections?.header as Record<string, unknown> | undefined;
  const settings = header?.settings;
  return settings && typeof settings === 'object' ? (settings as Record<string, unknown>) : {};
}

export function normalizeThemeCartType(value: unknown): ThemeCartType {
  if (typeof value === 'string') {
    const match = THEME_CART_TYPE_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_CART_TYPE_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_CART.type;
}

export function normalizeThemeCartTextCase(value: unknown): ThemeCartTextCase {
  if (typeof value === 'string') {
    const match = THEME_TEXT_CASE_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_TEXT_CASE_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_CART.productTitleCase;
}

export function normalizeThemeCartPriceFont(value: unknown): ThemeFontRole {
  if (typeof value === 'string') {
    const match = THEME_FONT_ROLE_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value as ThemeFontRole;
    const byLabel = THEME_FONT_ROLE_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value as ThemeFontRole;
  }
  return THEME_DEFAULT_CART.priceFont;
}

export function readThemeCartSettings(
  config: Record<string, unknown> | null | undefined
): ThemeCartSettings {
  const cart = readCartSettings(config);
  const header = readHeaderCartFallback(config);

  const type = cart.type ?? header.cartType;
  const productTitleCase = cart.productTitleCase ?? header.productTitleCase;
  const cartDrawerAutoOpen = cart.cartDrawerAutoOpen ?? header.cartDrawerAutoOpen;
  const emptyCartLink = cart.emptyCartLink ?? header.emptyCartLink;

  return {
    type: normalizeThemeCartType(type),
    productTitleCase: normalizeThemeCartTextCase(productTitleCase),
    priceFont: normalizeThemeCartPriceFont(cart.priceFont),
    cartDrawerAutoOpen: readBoolSetting(
      cartDrawerAutoOpen,
      THEME_DEFAULT_CART.cartDrawerAutoOpen
    ),
    allowNoteToSeller: readBoolSetting(cart.allowNoteToSeller, THEME_DEFAULT_CART.allowNoteToSeller),
    allowDiscounts: readBoolSetting(cart.allowDiscounts, THEME_DEFAULT_CART.allowDiscounts),
    installments: readBoolSetting(cart.installments, THEME_DEFAULT_CART.installments),
    acceleratedCheckout: readBoolSetting(
      cart.acceleratedCheckout,
      THEME_DEFAULT_CART.acceleratedCheckout
    ),
    emptyCartLink:
      typeof emptyCartLink === 'string' && emptyCartLink.trim()
        ? emptyCartLink
        : THEME_DEFAULT_CART.emptyCartLink,
    emptyCartLinkLabel: resolveCartEmptyLinkLabel(
      typeof emptyCartLink === 'string' && emptyCartLink.trim()
        ? emptyCartLink
        : THEME_DEFAULT_CART.emptyCartLink,
      cart.emptyCartLinkLabel
    ),
  };
}

export function readThemeCartSettingsFromValues(
  values: Record<string, string | boolean>
): ThemeCartSettings {
  return {
    type: normalizeThemeCartType(values[THEME_CART_TYPE_PATH]),
    productTitleCase: normalizeThemeCartTextCase(values[THEME_CART_PRODUCT_TITLE_CASE_PATH]),
    priceFont: normalizeThemeCartPriceFont(values[THEME_CART_PRICE_FONT_PATH]),
    cartDrawerAutoOpen: readBoolSetting(
      values[THEME_CART_DRAWER_AUTO_OPEN_PATH],
      THEME_DEFAULT_CART.cartDrawerAutoOpen
    ),
    allowNoteToSeller: readBoolSetting(
      values[THEME_CART_ALLOW_NOTE_PATH],
      THEME_DEFAULT_CART.allowNoteToSeller
    ),
    allowDiscounts: readBoolSetting(
      values[THEME_CART_ALLOW_DISCOUNTS_PATH],
      THEME_DEFAULT_CART.allowDiscounts
    ),
    installments: readBoolSetting(
      values[THEME_CART_INSTALLMENTS_PATH],
      THEME_DEFAULT_CART.installments
    ),
    acceleratedCheckout: readBoolSetting(
      values[THEME_CART_ACCELERATED_CHECKOUT_PATH],
      THEME_DEFAULT_CART.acceleratedCheckout
    ),
    emptyCartLink:
      typeof values[THEME_CART_EMPTY_LINK_PATH] === 'string' &&
      String(values[THEME_CART_EMPTY_LINK_PATH]).trim()
        ? String(values[THEME_CART_EMPTY_LINK_PATH])
        : THEME_DEFAULT_CART.emptyCartLink,
    emptyCartLinkLabel: resolveCartEmptyLinkLabel(
      typeof values[THEME_CART_EMPTY_LINK_PATH] === 'string' &&
        String(values[THEME_CART_EMPTY_LINK_PATH]).trim()
        ? String(values[THEME_CART_EMPTY_LINK_PATH])
        : THEME_DEFAULT_CART.emptyCartLink,
      values[THEME_CART_EMPTY_LINK_LABEL_PATH]
    ),
  };
}

export function syncThemeCartHeaderFieldValues(
  cart: ThemeCartSettings
): Record<string, string | boolean> {
  return {
    [THEME_CART_TYPE_PATH]: cart.type,
    [THEME_CART_PRODUCT_TITLE_CASE_PATH]: cart.productTitleCase,
    [THEME_CART_PRICE_FONT_PATH]: cart.priceFont,
    [THEME_CART_DRAWER_AUTO_OPEN_PATH]: cart.cartDrawerAutoOpen,
    [THEME_CART_ALLOW_NOTE_PATH]: cart.allowNoteToSeller,
    [THEME_CART_ALLOW_DISCOUNTS_PATH]: cart.allowDiscounts,
    [THEME_CART_INSTALLMENTS_PATH]: cart.installments,
    [THEME_CART_ACCELERATED_CHECKOUT_PATH]: cart.acceleratedCheckout,
    [THEME_CART_EMPTY_LINK_PATH]: cart.emptyCartLink,
    [THEME_CART_EMPTY_LINK_LABEL_PATH]: cart.emptyCartLinkLabel,
    [THEME_CART_HEADER_CART_TYPE_PATH]: cart.type,
    [THEME_CART_HEADER_PRODUCT_TITLE_CASE_PATH]: cart.productTitleCase,
    [THEME_CART_HEADER_DRAWER_AUTO_OPEN_PATH]: cart.cartDrawerAutoOpen,
    [THEME_CART_HEADER_EMPTY_LINK_PATH]: cart.emptyCartLink,
  };
}

export function applyThemeCartToHeaderConfig(config: Record<string, unknown>): void {
  const cart = readThemeCartSettings(config);
  const sections = (config.sections ?? {}) as Record<string, unknown>;
  const header = (sections.header ?? {}) as Record<string, unknown>;
  const headerSettings = (header.settings ?? {}) as Record<string, unknown>;

  headerSettings.cartType = cart.type;
  headerSettings.productTitleCase = cart.productTitleCase;
  headerSettings.cartDrawerAutoOpen = cart.cartDrawerAutoOpen;
  headerSettings.emptyCartLink = cart.emptyCartLink;

  header.settings = headerSettings;
  sections.header = header;
  config.sections = sections;
}

export function seedThemeCartValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const cart = readThemeCartSettings(config);
  return {
    ...values,
    ...syncThemeCartHeaderFieldValues(cart),
  };
}

export function ensureThemeCartDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const cart = (settings.cart ?? {}) as Record<string, unknown>;
  const header = readHeaderCartFallback(config);

  if (!settings.cart || typeof settings.cart !== 'object') {
    settings.cart = cart;
  }

  if (cart.type == null && header.cartType != null) cart.type = header.cartType;
  if (cart.productTitleCase == null && header.productTitleCase != null) {
    cart.productTitleCase = header.productTitleCase;
  }
  if (cart.cartDrawerAutoOpen == null && header.cartDrawerAutoOpen != null) {
    cart.cartDrawerAutoOpen = header.cartDrawerAutoOpen;
  }
  if (cart.emptyCartLink == null && header.emptyCartLink != null) {
    cart.emptyCartLink = header.emptyCartLink;
  }

  const resolved = readThemeCartSettings({ ...config, settings: { ...settings, cart } });

  cart.type = resolved.type;
  cart.productTitleCase = resolved.productTitleCase;
  cart.priceFont = resolved.priceFont;
  cart.cartDrawerAutoOpen = resolved.cartDrawerAutoOpen;
  cart.allowNoteToSeller = resolved.allowNoteToSeller;
  cart.allowDiscounts = resolved.allowDiscounts;
  cart.installments = resolved.installments;
  cart.acceleratedCheckout = resolved.acceleratedCheckout;
  cart.emptyCartLink = resolved.emptyCartLink;
  cart.emptyCartLinkLabel = resolved.emptyCartLinkLabel;

  settings.cart = cart;
  config.settings = settings;

  applyThemeCartToHeaderConfig(config);
}

export function resolveCartLinkDisplayLabel(url: string, storedLabel?: unknown): string {
  return resolveCartEmptyLinkLabel(url, storedLabel);
}

export function resolveCartEmptyLinkLabel(url: string, storedLabel?: unknown): string {
  if (typeof storedLabel === 'string' && storedLabel.trim()) {
    return storedLabel.trim();
  }
  const trimmed = url.trim();
  if (!trimmed) return 'Select link';
  if (trimmed === '/' || trimmed === '/index') return 'Home page';
  if (
    trimmed === '/products' ||
    trimmed === '/collections/all' ||
    trimmed.endsWith('/products')
  ) {
    return 'All Products';
  }
  if (trimmed === '/collections' || trimmed.endsWith('/collections')) return 'Collections';
  if (trimmed === '/cart') return 'Cart';
  if (trimmed === '/search') return 'Search';
  if (trimmed.startsWith('/collections/')) {
    const handle = trimmed.slice('/collections/'.length);
    return handle ? handle.replace(/-/g, ' ') : 'Collection';
  }
  if (trimmed.startsWith('/products/')) {
    const handle = trimmed.slice('/products/'.length);
    return handle ? handle.replace(/-/g, ' ') : 'Product';
  }
  return trimmed;
}

export const THEME_CART_SCHEMA_GROUP = {
  id: 'cart',
  label: 'Cart',
  fields: [
    { path: THEME_CART_TYPE_PATH, type: 'text', label: 'Type' },
    { path: THEME_CART_PRODUCT_TITLE_CASE_PATH, type: 'text', label: 'Product title case' },
    { path: THEME_CART_PRICE_FONT_PATH, type: 'text', label: 'Price font' },
    { path: THEME_CART_DRAWER_AUTO_OPEN_PATH, type: 'boolean', label: 'Auto-open drawer' },
    { path: THEME_CART_ALLOW_NOTE_PATH, type: 'boolean', label: 'Allow note to seller' },
    { path: THEME_CART_ALLOW_DISCOUNTS_PATH, type: 'boolean', label: 'Allow discounts in cart' },
    { path: THEME_CART_INSTALLMENTS_PATH, type: 'boolean', label: 'Installments' },
    {
      path: THEME_CART_ACCELERATED_CHECKOUT_PATH,
      type: 'boolean',
      label: 'Accelerated checkout buttons',
    },
    { path: THEME_CART_EMPTY_LINK_PATH, type: 'text', label: 'Empty cart button link' },
    { path: THEME_CART_EMPTY_LINK_LABEL_PATH, type: 'text', label: 'Empty cart button link label' },
  ],
} as const;

export function withThemeCartSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'cart');
  const nextGroup = {
    id: THEME_CART_SCHEMA_GROUP.id,
    label: THEME_CART_SCHEMA_GROUP.label,
    fields: [...THEME_CART_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const buttonsIndex = groups.findIndex((g) => g.id === 'buttons');
    if (buttonsIndex >= 0) {
      groups.splice(buttonsIndex + 1, 0, nextGroup);
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
