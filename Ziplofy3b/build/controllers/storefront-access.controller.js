"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyStorefrontPassword = exports.getStorefrontAccess = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const online_store_preferences_model_1 = require("../models/online-store-preferences/online-store-preferences.model");
const error_utils_1 = require("../utils/error.utils");
const storefront_access_util_1 = require("../utils/storefront-access.util");
exports.getStorefrontAccess = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const preferences = await online_store_preferences_model_1.OnlineStorePreferences.findOne({ storeId }).lean();
    const passwordProtectionEnabled = Boolean(preferences?.passwordProtectionEnabled);
    const hasStorefrontPassword = Boolean(preferences?.storefrontPassword?.trim());
    const protectionActive = passwordProtectionEnabled && hasStorefrontPassword;
    const unlocked = !protectionActive || (0, storefront_access_util_1.isStorefrontUnlocked)(req, storeId);
    return res.status(200).json({
        success: true,
        data: {
            passwordProtectionEnabled: protectionActive,
            messageToYourVisitors: preferences?.messageToYourVisitors?.trim() || '',
            unlocked,
        },
        message: 'Storefront access fetched',
    });
});
exports.verifyStorefrontPassword = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { password } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
        throw new error_utils_1.CustomError('Password is required', 400);
    }
    const preferences = await online_store_preferences_model_1.OnlineStorePreferences.findOne({ storeId })
        .select('passwordProtectionEnabled storefrontPassword messageToYourVisitors')
        .lean();
    if (!preferences?.passwordProtectionEnabled || !preferences.storefrontPassword?.trim()) {
        throw new error_utils_1.CustomError('Password protection is not enabled for this store', 400);
    }
    if (password.trim() !== preferences.storefrontPassword.trim()) {
        throw new error_utils_1.CustomError('Incorrect password', 401);
    }
    const unlockToken = (0, storefront_access_util_1.signStorefrontUnlockToken)(storeId);
    return res.status(200).json({
        success: true,
        data: {
            unlocked: true,
            unlockToken,
            messageToYourVisitors: preferences.messageToYourVisitors?.trim() || '',
        },
        message: 'Storefront unlocked',
    });
});
