"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStorefrontAccessIfEnabled = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const online_store_preferences_model_1 = require("../models/online-store-preferences/online-store-preferences.model");
const error_utils_1 = require("../utils/error.utils");
const storefront_access_util_1 = require("../utils/storefront-access.util");
exports.requireStorefrontAccessIfEnabled = (0, error_utils_1.asyncErrorHandler)(async (req, res, next) => {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        return next();
    }
    const preferences = await online_store_preferences_model_1.OnlineStorePreferences.findOne({ storeId })
        .select('passwordProtectionEnabled storefrontPassword')
        .lean();
    const protectionActive = Boolean(preferences?.passwordProtectionEnabled) &&
        Boolean(preferences?.storefrontPassword?.trim());
    if (!protectionActive) {
        return next();
    }
    if ((0, storefront_access_util_1.isStorefrontUnlocked)(req, storeId)) {
        return next();
    }
    throw new error_utils_1.CustomError('Storefront password required', 403);
});
