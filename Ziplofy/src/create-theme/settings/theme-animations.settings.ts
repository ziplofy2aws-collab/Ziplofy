import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';

export const THEME_ANIMATIONS_PAGE_TRANSITION_PATH = 'settings.animations.pageTransition';
export const THEME_ANIMATIONS_PRODUCT_CARD_TRANSITION_PATH =
  'settings.animations.productCardTransition';
export const THEME_ANIMATIONS_ADD_TO_CART_PATH = 'settings.animations.addToCart';
export const THEME_ANIMATIONS_CARD_HOVER_EFFECT_PATH = 'settings.animations.cardHoverEffect';

export const THEME_CARD_HOVER_EFFECT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'lift', label: 'Lift' },
  { value: 'scale', label: 'Scale' },
  { value: 'zoom', label: 'Zoom' },
] as const;

export type ThemeCardHoverEffect = (typeof THEME_CARD_HOVER_EFFECT_OPTIONS)[number]['value'];

export const THEME_DEFAULT_ANIMATIONS = {
  pageTransition: false,
  productCardTransition: false,
  addToCart: true,
  cardHoverEffect: 'none' as ThemeCardHoverEffect,
};

export type ThemeAnimationsSettings = {
  pageTransition: boolean;
  productCardTransition: boolean;
  addToCart: boolean;
  cardHoverEffect: ThemeCardHoverEffect;
};

function readAnimationsSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const animations = settings?.animations;
  return animations && typeof animations === 'object' ? (animations as Record<string, unknown>) : {};
}

export function readBoolSetting(value: unknown, fallback: boolean): boolean {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return fallback;
}

export function normalizeThemeCardHoverEffect(value: unknown): ThemeCardHoverEffect {
  if (typeof value === 'string' && value === 'subtle-zoom') return 'zoom';
  if (typeof value === 'string') {
    const match = THEME_CARD_HOVER_EFFECT_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_CARD_HOVER_EFFECT_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_ANIMATIONS.cardHoverEffect;
}

export function readThemeAnimationsSettings(
  config: Record<string, unknown> | null | undefined
): ThemeAnimationsSettings {
  const animations = readAnimationsSettings(config);
  return {
    pageTransition: readBoolSetting(
      animations.pageTransition,
      THEME_DEFAULT_ANIMATIONS.pageTransition
    ),
    productCardTransition: readBoolSetting(
      animations.productCardTransition,
      THEME_DEFAULT_ANIMATIONS.productCardTransition
    ),
    addToCart: readBoolSetting(animations.addToCart, THEME_DEFAULT_ANIMATIONS.addToCart),
    cardHoverEffect: normalizeThemeCardHoverEffect(animations.cardHoverEffect),
  };
}

export function seedThemeAnimationsValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const animations = readThemeAnimationsSettings(config);
  return {
    ...values,
    [THEME_ANIMATIONS_PAGE_TRANSITION_PATH]: animations.pageTransition,
    [THEME_ANIMATIONS_PRODUCT_CARD_TRANSITION_PATH]: animations.productCardTransition,
    [THEME_ANIMATIONS_ADD_TO_CART_PATH]: animations.addToCart,
    [THEME_ANIMATIONS_CARD_HOVER_EFFECT_PATH]: animations.cardHoverEffect,
  };
}

export function ensureThemeAnimationsDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const animations = (settings.animations ?? {}) as Record<string, unknown>;
  if (!settings.animations || typeof settings.animations !== 'object') {
    settings.animations = animations;
  }

  if (animations.pageTransition == null) {
    animations.pageTransition = THEME_DEFAULT_ANIMATIONS.pageTransition;
  }
  if (animations.productCardTransition == null) {
    animations.productCardTransition = THEME_DEFAULT_ANIMATIONS.productCardTransition;
  }
  if (animations.addToCart == null) {
    animations.addToCart = THEME_DEFAULT_ANIMATIONS.addToCart;
  }
  if (animations.cardHoverEffect == null) {
    animations.cardHoverEffect = THEME_DEFAULT_ANIMATIONS.cardHoverEffect;
  }

  settings.animations = animations;
  config.settings = settings;
}

export const THEME_ANIMATIONS_SCHEMA_GROUP = {
  id: 'animations',
  label: 'Animations',
  fields: [
    { path: THEME_ANIMATIONS_PAGE_TRANSITION_PATH, type: 'boolean', label: 'Page transition' },
    {
      path: THEME_ANIMATIONS_PRODUCT_CARD_TRANSITION_PATH,
      type: 'boolean',
      label: 'Product card to product page transition',
    },
    { path: THEME_ANIMATIONS_ADD_TO_CART_PATH, type: 'boolean', label: 'Add to cart' },
    {
      path: THEME_ANIMATIONS_CARD_HOVER_EFFECT_PATH,
      type: 'text',
      label: 'Card hover effect',
    },
  ],
} as const;

export function withThemeAnimationsSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'animations');
  const nextGroup = {
    id: THEME_ANIMATIONS_SCHEMA_GROUP.id,
    label: THEME_ANIMATIONS_SCHEMA_GROUP.label,
    fields: [...THEME_ANIMATIONS_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const pageIndex = groups.findIndex((g) => g.id === 'page-layout');
    if (pageIndex >= 0) {
      groups.splice(pageIndex + 1, 0, nextGroup);
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
