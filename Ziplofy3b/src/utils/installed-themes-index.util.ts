import mongoose from "mongoose";
import { InstalledThemes } from "../models/installed-themes.model";

/**
 * Drops a legacy unique index on `{ store: 1 }` only, which prevented multiple
 * catalog themes per store. The schema expects uniqueness on `{ store, theme }` only.
 */
export async function reconcileInstalledThemesIndexes(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const coll = InstalledThemes.collection;
    const indexes = await coll.indexes();
    for (const idx of indexes) {
      const key = idx.key as Record<string, number>;
      const keyNames = Object.keys(key);
      const isStoreOnlyUnique =
        idx.unique === true &&
        keyNames.length === 1 &&
        keyNames[0] === "store" &&
        idx.name !== "_id_";
      if (isStoreOnlyUnique && idx.name) {
        await coll.dropIndex(idx.name);
        console.log(
          `[InstalledThemes] Dropped obsolete unique index "${idx.name}" (store-only). Multiple themes per store are allowed.`
        );
      }
    }
  } catch (err) {
    console.warn("[InstalledThemes] Could not reconcile indexes:", err);
  }
}
