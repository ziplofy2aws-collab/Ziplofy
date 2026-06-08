"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uninstallThemeForStore = exports.getInstalledThemesByStore = exports.installThemeForStore = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const installed_themes_model_1 = require("../models/installed-themes.model");
const theme_model_1 = require("../models/theme.model");
const error_utils_1 = require("../utils/error.utils");
const installed_themes_list_util_1 = require("../utils/installed-themes-list.util");
exports.installThemeForStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, themeId } = req.body;
    if (!storeId || !themeId)
        throw new error_utils_1.CustomError('storeId and themeId are required', 400);
    const validTheme = await theme_model_1.Theme.findById(themeId);
    if (!validTheme)
        throw new error_utils_1.CustomError('Theme not found', 404);
    await installed_themes_model_1.InstalledThemes.findOneAndUpdate({ store: new mongoose_1.default.Types.ObjectId(storeId), theme: new mongoose_1.default.Types.ObjectId(themeId) }, {
        $set: {
            store: new mongoose_1.default.Types.ObjectId(storeId),
            theme: new mongoose_1.default.Types.ObjectId(themeId),
            uninstalledAt: null,
            installedAt: new Date(),
        },
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const data = await (0, installed_themes_list_util_1.listInstalledThemesForStore)(storeId);
    return res.status(200).json({ success: true, data });
});
exports.getInstalledThemesByStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId)
        throw new error_utils_1.CustomError('storeId is required', 400);
    const data = await (0, installed_themes_list_util_1.listInstalledThemesForStore)(storeId);
    return res.status(200).json({ success: true, data });
});
// Uninstall (deactivate) theme for a store
exports.uninstallThemeForStore = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const installedThemeId = req.params.installedThemeId;
    if (!installedThemeId)
        throw new error_utils_1.CustomError('installedThemeId is required', 400);
    const deleted = await installed_themes_model_1.InstalledThemes.findByIdAndDelete(new mongoose_1.default.Types.ObjectId(installedThemeId));
    if (!deleted)
        throw new error_utils_1.CustomError('Installed theme not found', 404);
    return res.status(200).json({ success: true, message: 'Theme uninstalled for store', data: deleted });
});
