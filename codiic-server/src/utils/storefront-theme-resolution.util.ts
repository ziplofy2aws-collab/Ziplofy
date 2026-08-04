import { Types } from 'mongoose';
import { Store } from '../models/store/store.model';
import { StoreCustomTheme } from '../models/store-custom-theme/store-custom-theme.model';
import {
  resolveAppliedStoreTheme,
  type ResolvedAppliedStoreTheme,
} from './storefront-liquid.util';

export type StorefrontThemeKind = 'store-custom' | 'catalog' | 'none';

export type ResolvedStorefrontThemeSource = {
  kind: StorefrontThemeKind;
  storeCustomThemeId: string | null;
  storeCustomThemeName: string | null;
  catalogThemeId: string | null;
  catalogThemeName: string | null;
  /** Present when kind === 'catalog' — reuse in theme-runtime to avoid a second resolve. */
  catalogResolved?: ResolvedAppliedStoreTheme | null;
  /** Present when kind === 'store-custom' — reuse config without a second DB read. */
  storeCustomThemeConfig?: Record<string, unknown> | null;
};

type StoreThemePointersLean = {
  appliedCustomThemeId?: unknown;
  appliedTheme?: unknown;
};

async function resolveStoreCustomThemeSource(
  storeId: string,
  customThemeId: string
): Promise<ResolvedStorefrontThemeSource | null> {
  const customDoc = await StoreCustomTheme.findOne({
    _id: customThemeId,
    storeId: new Types.ObjectId(storeId),
  })
    .select('themeName themeConfig')
    .lean();

  if (!customDoc?.themeConfig || typeof customDoc.themeConfig !== 'object') {
    return null;
  }

  return {
    kind: 'store-custom',
    storeCustomThemeId: customThemeId,
    storeCustomThemeName: customDoc.themeName ?? 'Custom theme',
    catalogThemeId: null,
    catalogThemeName: null,
    storeCustomThemeConfig: customDoc.themeConfig as Record<string, unknown>,
  };
}

/**
 * Single source of truth for which theme is live on a store.
 * `appliedTheme` and `appliedCustomThemeId` are mutually exclusive on write;
 * when both are present (legacy data), catalog `appliedTheme` is resolved first.
 */
export async function resolveStorefrontThemeSource(
  storeId: string,
  options?: { storeDoc?: StoreThemePointersLean | null }
): Promise<ResolvedStorefrontThemeSource> {
  const storeDoc =
    options?.storeDoc !== undefined
      ? options.storeDoc
      : await Store.findById(storeId).select('appliedCustomThemeId appliedTheme').lean();

  const hasCatalogPointer = Boolean(storeDoc?.appliedTheme);
  const customThemeId = storeDoc?.appliedCustomThemeId
    ? String(storeDoc.appliedCustomThemeId)
    : null;

  if (hasCatalogPointer) {
    const resolved = await resolveAppliedStoreTheme(storeId, { storeDoc });
    if (resolved) {
      return {
        kind: 'catalog',
        storeCustomThemeId: null,
        storeCustomThemeName: null,
        catalogThemeId: resolved.appliedThemeId,
        catalogThemeName: resolved.themeName,
        catalogResolved: resolved,
      };
    }
  }

  if (customThemeId) {
    const custom = await resolveStoreCustomThemeSource(storeId, customThemeId);
    if (custom) {
      return custom;
    }
  }

  return {
    kind: 'none',
    storeCustomThemeId: null,
    storeCustomThemeName: null,
    catalogThemeId: null,
    catalogThemeName: null,
  };
}
