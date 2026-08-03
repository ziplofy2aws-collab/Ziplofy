import mongoose from 'mongoose';
import { InstalledThemes } from '../models/installed-themes.model';
import { Theme } from '../models/theme.model';
import { Store } from '../models/store/store.model';
import { canonicalStoreRef } from './installed-themes-query.util';

export type DefaultStoreThemeAssignment = {
  themeId: string;
  themeName: string;
  installedThemeId: string;
};

/**
 * Pick an active catalog theme (optional env override), install it for the store,
 * and set store.appliedTheme. Does not fail store creation if no themes exist.
 *
 * Env: DEFAULT_CATALOG_THEME_ID — preferred theme ObjectId when present and active.
 */
export async function assignDefaultCatalogThemeToStore(
  storeId: mongoose.Types.ObjectId | string
): Promise<DefaultStoreThemeAssignment | null> {
  const storeObjectId =
    typeof storeId === 'string' ? new mongoose.Types.ObjectId(storeId) : storeId;
  const storeIdStr = String(storeObjectId);

  const preferredId = process.env.DEFAULT_CATALOG_THEME_ID?.trim();
  let theme =
    preferredId && mongoose.Types.ObjectId.isValid(preferredId)
      ? await Theme.findOne({ _id: preferredId, isActive: true }).select('_id name').lean()
      : null;

  if (!theme) {
    const activeCount = await Theme.countDocuments({ isActive: true });
    if (activeCount === 0) {
      console.warn(
        `[assignDefaultCatalogThemeToStore] No active catalog themes; store ${storeIdStr} left without a default theme`
      );
      return null;
    }
    const skip = Math.floor(Math.random() * activeCount);
    const [picked] = await Theme.find({ isActive: true })
      .select('_id name')
      .skip(skip)
      .limit(1)
      .lean();
    theme = picked ?? null;
  }

  if (!theme?._id) {
    console.warn(
      `[assignDefaultCatalogThemeToStore] Failed to pick a catalog theme for store ${storeIdStr}`
    );
    return null;
  }

  const themeObjectId = theme._id as mongoose.Types.ObjectId;
  const storeRef = canonicalStoreRef(storeIdStr);

  const installedTheme = await InstalledThemes.findOneAndUpdate(
    { store: storeRef, theme: themeObjectId },
    {
      $set: {
        store: storeRef,
        theme: themeObjectId,
        uninstalledAt: null,
        installedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Store.findByIdAndUpdate(storeObjectId, {
    $set: {
      appliedTheme: themeObjectId,
      appliedCustomThemeId: null,
    },
  });

  return {
    themeId: String(themeObjectId),
    themeName: String(theme.name ?? 'Theme'),
    installedThemeId: String(installedTheme._id),
  };
}
