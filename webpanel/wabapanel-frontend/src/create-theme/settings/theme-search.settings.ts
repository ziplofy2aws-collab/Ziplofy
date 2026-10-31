import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';

export const THEME_SEARCH_EMPTY_STATE_COLLECTION_ID_PATH =
  'settings.search.emptyStateCollectionId';
export const THEME_SEARCH_EMPTY_STATE_COLLECTION_TITLE_PATH =
  'settings.search.emptyStateCollectionTitle';
export const THEME_SEARCH_EMPTY_STATE_COLLECTION_HANDLE_PATH =
  'settings.search.emptyStateCollectionHandle';
export const THEME_SEARCH_POPOVER_PRODUCT_CORNER_RADIUS_PATH =
  'settings.search.popover.productCornerRadius';
export const THEME_SEARCH_POPOVER_CARD_CORNER_RADIUS_PATH =
  'settings.search.popover.cardCornerRadius';
export const THEME_SEARCH_POPOVER_TITLE_CASE_PATH = 'settings.search.popover.titleCase';

export const THEME_SEARCH_CORNER_RADIUS_MIN = 0;
export const THEME_SEARCH_CORNER_RADIUS_MAX = 100;

export const THEME_SEARCH_TITLE_CASE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'uppercase', label: 'Uppercase' },
] as const;

export type ThemeSearchTitleCase = (typeof THEME_SEARCH_TITLE_CASE_OPTIONS)[number]['value'];

export const THEME_DEFAULT_SEARCH = {
  emptyStateCollectionId: '',
  emptyStateCollectionTitle: '',
  emptyStateCollectionHandle: '',
  popover: {
    productCornerRadius: 0,
    cardCornerRadius: 4,
    titleCase: 'default' as ThemeSearchTitleCase,
  },
};

export type ThemeSearchPopoverSettings = {
  productCornerRadius: number;
  cardCornerRadius: number;
  titleCase: ThemeSearchTitleCase;
};

export type ThemeSearchSettings = {
  emptyStateCollectionId: string;
  emptyStateCollectionTitle: string;
  emptyStateCollectionHandle: string;
  popover: ThemeSearchPopoverSettings;
};

function readSearchSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const settings = config?.settings as Record<string, unknown> | undefined;
  const search = settings?.search;
  return search && typeof search === 'object' ? (search as Record<string, unknown>) : {};
}

function readSearchPopoverSettings(
  config: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const search = readSearchSettings(config);
  const popover = search.popover;
  return popover && typeof popover === 'object' ? (popover as Record<string, unknown>) : {};
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizeThemeSearchTitleCase(value: unknown): ThemeSearchTitleCase {
  if (typeof value === 'string') {
    const match = THEME_SEARCH_TITLE_CASE_OPTIONS.find((opt) => opt.value === value);
    if (match) return match.value;
    const byLabel = THEME_SEARCH_TITLE_CASE_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return THEME_DEFAULT_SEARCH.popover.titleCase;
}

export function themeSearchTitleTextTransform(titleCase: ThemeSearchTitleCase): string {
  return titleCase === 'uppercase' ? 'uppercase' : 'none';
}

export function readThemeSearchSettings(
  config: Record<string, unknown> | null | undefined
): ThemeSearchSettings {
  const search = readSearchSettings(config);
  const popover = readSearchPopoverSettings(config);

  return {
    emptyStateCollectionId:
      typeof search.emptyStateCollectionId === 'string' ? search.emptyStateCollectionId : '',
    emptyStateCollectionTitle:
      typeof search.emptyStateCollectionTitle === 'string' ? search.emptyStateCollectionTitle : '',
    emptyStateCollectionHandle:
      typeof search.emptyStateCollectionHandle === 'string' ? search.emptyStateCollectionHandle : '',
    popover: {
      productCornerRadius: clampNumber(
        popover.productCornerRadius,
        THEME_SEARCH_CORNER_RADIUS_MIN,
        THEME_SEARCH_CORNER_RADIUS_MAX,
        THEME_DEFAULT_SEARCH.popover.productCornerRadius
      ),
      cardCornerRadius: clampNumber(
        popover.cardCornerRadius,
        THEME_SEARCH_CORNER_RADIUS_MIN,
        THEME_SEARCH_CORNER_RADIUS_MAX,
        THEME_DEFAULT_SEARCH.popover.cardCornerRadius
      ),
      titleCase: normalizeThemeSearchTitleCase(popover.titleCase),
    },
  };
}

export function readThemeSearchSettingsFromValues(
  values: Record<string, string | boolean>
): ThemeSearchSettings {
  return {
    emptyStateCollectionId:
      typeof values[THEME_SEARCH_EMPTY_STATE_COLLECTION_ID_PATH] === 'string'
        ? String(values[THEME_SEARCH_EMPTY_STATE_COLLECTION_ID_PATH])
        : '',
    emptyStateCollectionTitle:
      typeof values[THEME_SEARCH_EMPTY_STATE_COLLECTION_TITLE_PATH] === 'string'
        ? String(values[THEME_SEARCH_EMPTY_STATE_COLLECTION_TITLE_PATH])
        : '',
    emptyStateCollectionHandle:
      typeof values[THEME_SEARCH_EMPTY_STATE_COLLECTION_HANDLE_PATH] === 'string'
        ? String(values[THEME_SEARCH_EMPTY_STATE_COLLECTION_HANDLE_PATH])
        : '',
    popover: {
      productCornerRadius: clampNumber(
        values[THEME_SEARCH_POPOVER_PRODUCT_CORNER_RADIUS_PATH],
        THEME_SEARCH_CORNER_RADIUS_MIN,
        THEME_SEARCH_CORNER_RADIUS_MAX,
        THEME_DEFAULT_SEARCH.popover.productCornerRadius
      ),
      cardCornerRadius: clampNumber(
        values[THEME_SEARCH_POPOVER_CARD_CORNER_RADIUS_PATH],
        THEME_SEARCH_CORNER_RADIUS_MIN,
        THEME_SEARCH_CORNER_RADIUS_MAX,
        THEME_DEFAULT_SEARCH.popover.cardCornerRadius
      ),
      titleCase: normalizeThemeSearchTitleCase(values[THEME_SEARCH_POPOVER_TITLE_CASE_PATH]),
    },
  };
}

export function seedThemeSearchValues(
  values: Record<string, string | boolean>,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  const search = readThemeSearchSettings(config);
  return {
    ...values,
    [THEME_SEARCH_EMPTY_STATE_COLLECTION_ID_PATH]: search.emptyStateCollectionId,
    [THEME_SEARCH_EMPTY_STATE_COLLECTION_TITLE_PATH]: search.emptyStateCollectionTitle,
    [THEME_SEARCH_EMPTY_STATE_COLLECTION_HANDLE_PATH]: search.emptyStateCollectionHandle,
    [THEME_SEARCH_POPOVER_PRODUCT_CORNER_RADIUS_PATH]: search.popover.productCornerRadius,
    [THEME_SEARCH_POPOVER_CARD_CORNER_RADIUS_PATH]: search.popover.cardCornerRadius,
    [THEME_SEARCH_POPOVER_TITLE_CASE_PATH]: search.popover.titleCase,
  };
}

export function ensureThemeSearchDefaults(config: Record<string, unknown>): void {
  const settings = (config.settings ?? {}) as Record<string, unknown>;
  const search = (settings.search ?? {}) as Record<string, unknown>;
  const popover = (search.popover ?? {}) as Record<string, unknown>;

  if (!settings.search || typeof settings.search !== 'object') {
    settings.search = search;
  }
  if (!search.popover || typeof search.popover !== 'object') {
    search.popover = popover;
  }

  const resolved = readThemeSearchSettings({
    ...config,
    settings: { ...settings, search: { ...search, popover } },
  });

  search.emptyStateCollectionId = resolved.emptyStateCollectionId;
  search.emptyStateCollectionTitle = resolved.emptyStateCollectionTitle;
  search.emptyStateCollectionHandle = resolved.emptyStateCollectionHandle;
  popover.productCornerRadius = resolved.popover.productCornerRadius;
  popover.cardCornerRadius = resolved.popover.cardCornerRadius;
  popover.titleCase = resolved.popover.titleCase;

  search.popover = popover;
  settings.search = search;
  config.settings = settings;
}

export const THEME_SEARCH_SCHEMA_GROUP = {
  id: 'search',
  label: 'Search',
  fields: [
    {
      path: THEME_SEARCH_EMPTY_STATE_COLLECTION_ID_PATH,
      type: 'text',
      label: 'Empty state collection',
    },
    {
      path: THEME_SEARCH_EMPTY_STATE_COLLECTION_TITLE_PATH,
      type: 'text',
      label: 'Empty state collection title',
    },
    {
      path: THEME_SEARCH_EMPTY_STATE_COLLECTION_HANDLE_PATH,
      type: 'text',
      label: 'Empty state collection handle',
    },
    {
      path: THEME_SEARCH_POPOVER_PRODUCT_CORNER_RADIUS_PATH,
      type: 'number',
      label: 'Product corner radius',
    },
    {
      path: THEME_SEARCH_POPOVER_CARD_CORNER_RADIUS_PATH,
      type: 'number',
      label: 'Card corner radius',
    },
    {
      path: THEME_SEARCH_POPOVER_TITLE_CASE_PATH,
      type: 'text',
      label: 'Product and card title case',
    },
  ],
} as const;

export function withThemeSearchSchema(schema: EditorSchemaDoc): EditorSchemaDoc {
  const groups = [...(schema.globalSettings?.groups ?? [])];
  const existingIndex = groups.findIndex((g) => g.id === 'search');
  const nextGroup = {
    id: THEME_SEARCH_SCHEMA_GROUP.id,
    label: THEME_SEARCH_SCHEMA_GROUP.label,
    fields: [...THEME_SEARCH_SCHEMA_GROUP.fields],
  };

  if (existingIndex >= 0) {
    groups[existingIndex] = { ...groups[existingIndex], ...nextGroup };
  } else {
    const productCardsIndex = groups.findIndex((g) => g.id === 'product-cards');
    if (productCardsIndex >= 0) {
      groups.splice(productCardsIndex + 1, 0, nextGroup);
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
