"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileInstalledThemesIndexes = reconcileInstalledThemesIndexes;
const mongoose_1 = __importDefault(require("mongoose"));
const installed_themes_model_1 = require("../models/installed-themes.model");
/**
 * Drops a legacy unique index on `{ store: 1 }` only, which prevented multiple
 * catalog themes per store. The schema expects uniqueness on `{ store, theme }` only.
 */
async function reconcileInstalledThemesIndexes() {
    if (mongoose_1.default.connection.readyState !== 1)
        return;
    try {
        const coll = installed_themes_model_1.InstalledThemes.collection;
        const indexes = await coll.indexes();
        for (const idx of indexes) {
            const key = idx.key;
            const keyNames = Object.keys(key);
            const isStoreOnlyUnique = idx.unique === true &&
                keyNames.length === 1 &&
                keyNames[0] === "store" &&
                idx.name !== "_id_";
            if (isStoreOnlyUnique && idx.name) {
                await coll.dropIndex(idx.name);
                console.log(`[InstalledThemes] Dropped obsolete unique index "${idx.name}" (store-only). Multiple themes per store are allowed.`);
            }
        }
    }
    catch (err) {
        console.warn("[InstalledThemes] Could not reconcile indexes:", err);
    }
}
