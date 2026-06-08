"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSubdomain = exports.getSubdomainByStoreId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const store_model_1 = require("../models/store/store.model");
const store_custom_theme_model_1 = require("../models/store-custom-theme/store-custom-theme.model");
const subdomain_model_1 = require("../models/subdomain.model");
const error_utils_1 = require("../utils/error.utils");
exports.getSubdomainByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId) {
        return res.status(400).json({ success: false, message: 'storeId is required' });
    }
    const doc = await subdomain_model_1.Subdomain.findOne({ storeId: new mongoose_1.default.Types.ObjectId(storeId) });
    if (!doc) {
        return res.status(404).json({ success: false, message: 'Subdomain not found for store' });
    }
    // Build preview URL from subdomain (not stored in DB)
    const isProduction = process.env.NODE_ENV === 'production';
    const protocol = isProduction ? 'https' : 'http';
    const url = `${protocol}://${doc.subdomain}${config_1.config.storeRenderMicroserviceUrlSuffix}`;
    return res.status(200).json({ success: true, data: { ...doc.toObject(), url } });
});
// Public: check if a subdomain is valid and return store basic info
exports.checkSubdomain = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const subdomain = (req.query.subdomain || '').trim().toLowerCase();
    if (!subdomain) {
        return res.status(400).json({ success: false, message: 'subdomain is required' });
    }
    const mapping = await subdomain_model_1.Subdomain.findOne({ subdomain });
    if (!mapping) {
        return res.status(404).json({ success: false, message: 'Subdomain not found' });
    }
    const store = await store_model_1.Store.findById(mapping.storeId)
        .select('storeName storeDescription appliedCustomThemeId')
        .lean();
    if (!store) {
        return res.status(404).json({ success: false, message: 'Store not found for subdomain' });
    }
    const appliedCustomThemeId = store.appliedCustomThemeId
        ? String(store.appliedCustomThemeId)
        : null;
    let appliedCustomThemeName = null;
    if (appliedCustomThemeId) {
        const customTheme = await store_custom_theme_model_1.StoreCustomTheme.findById(appliedCustomThemeId)
            .select('themeName')
            .lean();
        appliedCustomThemeName = customTheme?.themeName ?? null;
    }
    return res.status(200).json({
        success: true,
        data: {
            storeId: store._id,
            name: store.storeName,
            description: store.storeDescription,
            appliedCustomThemeId,
            appliedCustomThemeName,
        }
    });
});
