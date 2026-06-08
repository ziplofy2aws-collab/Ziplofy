"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInstalledThemesForStore = listInstalledThemesForStore;
exports.resolveInstalledThemesStoreId = resolveInstalledThemesStoreId;
const mongoose_1 = require("mongoose");
const installed_themes_model_1 = require("../models/installed-themes.model");
/** InstalledThemes for a store, with Theme documents joined. */
async function listInstalledThemesForStore(storeId) {
    const rows = await installed_themes_model_1.InstalledThemes.find({
        store: new mongoose_1.Types.ObjectId(storeId),
        uninstalledAt: null,
    })
        .populate('theme')
        .sort({ installedAt: -1 })
        .lean();
    return rows
        .filter((row) => row.theme && typeof row.theme === 'object' && 'name' in row.theme)
        .map((row) => {
        const theme = row.theme;
        return {
            _id: theme._id,
            name: theme.name,
            description: theme.description,
            category: theme.category,
            thumbnailUrl: theme.s3Assets?.thumbnail?.url ?? null,
            installedThemeId: row._id,
            installedAt: row.installedAt,
            uninstalledAt: row.uninstalledAt,
            isCustomTheme: false,
        };
    });
}
function resolveInstalledThemesStoreId(req) {
    const q = req.query;
    return q.storeId || q.userId || req.params.userId || req.user?.id || null;
}
