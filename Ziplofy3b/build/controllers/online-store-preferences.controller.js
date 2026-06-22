"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOnlineStorePreferences = exports.getOnlineStorePreferencesByStoreId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const online_store_preferences_model_1 = require("../models/online-store-preferences/online-store-preferences.model");
const store_model_1 = require("../models/store/store.model");
const error_utils_1 = require("../utils/error.utils");
function trimOptionalString(value, maxLength) {
    if (typeof value !== 'string')
        return undefined;
    const trimmed = value.trim();
    if (!trimmed)
        return undefined;
    if (maxLength !== undefined && trimmed.length > maxLength) {
        throw new error_utils_1.CustomError(`Value cannot exceed ${maxLength} characters`, 400);
    }
    return trimmed;
}
function extractPayload(body) {
    const payload = {};
    if (typeof body.passwordProtectionEnabled === 'boolean') {
        payload.passwordProtectionEnabled = body.passwordProtectionEnabled;
    }
    if (typeof body.b2bCustomersOnly === 'boolean') {
        payload.b2bCustomersOnly = body.b2bCustomersOnly;
    }
    x;
    if (typeof body.countryRedirectionEnabled === 'boolean') {
        payload.countryRedirectionEnabled = body.countryRedirectionEnabled;
    }
    if (typeof body.languageRedirectionEnabled === 'boolean') {
        payload.languageRedirectionEnabled = body.languageRedirectionEnabled;
    }
    if (typeof body.spamContactFormsEnabled === 'boolean') {
        payload.spamContactFormsEnabled = body.spamContactFormsEnabled;
    }
    if (typeof body.spamAuthPagesEnabled === 'boolean') {
        payload.spamAuthPagesEnabled = body.spamAuthPagesEnabled;
    }
    if (body.storefrontPassword !== undefined) {
        payload.storefrontPassword = trimOptionalString(body.storefrontPassword, online_store_preferences_model_1.ONLINE_STORE_PREFERENCES_LIMITS.storefrontPassword);
    }
    if (body.messageToYourVisitors !== undefined) {
        const message = typeof body.messageToYourVisitors === 'string' ? body.messageToYourVisitors.trim() : '';
        if (message.length > online_store_preferences_model_1.ONLINE_STORE_PREFERENCES_LIMITS.messageToYourVisitors) {
            throw new error_utils_1.CustomError(`Message to visitors cannot exceed ${online_store_preferences_model_1.ONLINE_STORE_PREFERENCES_LIMITS.messageToYourVisitors} characters`, 400);
        }
        payload.messageToYourVisitors = message;
    }
    if (body.seoHomePageTitle !== undefined) {
        const title = typeof body.seoHomePageTitle === 'string' ? body.seoHomePageTitle.trim() : '';
        if (title.length > online_store_preferences_model_1.ONLINE_STORE_PREFERENCES_LIMITS.seoHomePageTitle) {
            throw new error_utils_1.CustomError(`SEO home page title cannot exceed ${online_store_preferences_model_1.ONLINE_STORE_PREFERENCES_LIMITS.seoHomePageTitle} characters`, 400);
        }
        payload.seoHomePageTitle = title;
    }
    if (body.seoMetaDescription !== undefined) {
        const description = typeof body.seoMetaDescription === 'string' ? body.seoMetaDescription.trim() : '';
        if (description.length > online_store_preferences_model_1.ONLINE_STORE_PREFERENCES_LIMITS.seoMetaDescription) {
            throw new error_utils_1.CustomError(`SEO meta description cannot exceed ${online_store_preferences_model_1.ONLINE_STORE_PREFERENCES_LIMITS.seoMetaDescription} characters`, 400);
        }
        payload.seoMetaDescription = description;
    }
    if (body.seoSocialImageUrl !== undefined) {
        payload.seoSocialImageUrl =
            typeof body.seoSocialImageUrl === 'string' ? body.seoSocialImageUrl.trim() : '';
    }
    return payload;
}
function formatPreferencesResponse(preferences) {
    const { storefrontPassword, ...rest } = preferences;
    return {
        ...rest,
        hasStorefrontPassword: Boolean(storefrontPassword?.trim()),
    };
}
async function getOrCreatePreferences(storeId) {
    let preferences = await online_store_preferences_model_1.OnlineStorePreferences.findOne({ storeId });
    if (!preferences) {
        const store = await store_model_1.Store.findById(storeId)
            .select('seoHomePageTitle seoMetaDescription seoSocialImageUrl')
            .lean();
        preferences = await online_store_preferences_model_1.OnlineStorePreferences.create({
            storeId,
            seoHomePageTitle: store?.seoHomePageTitle ?? '',
            seoMetaDescription: store?.seoMetaDescription ?? '',
            seoSocialImageUrl: store?.seoSocialImageUrl ?? '',
        });
    }
    return preferences;
}
async function syncStoreSeoFields(storeId, payload) {
    const seoUpdate = {};
    if (payload.seoHomePageTitle !== undefined) {
        seoUpdate.seoHomePageTitle = payload.seoHomePageTitle;
    }
    if (payload.seoMetaDescription !== undefined) {
        seoUpdate.seoMetaDescription = payload.seoMetaDescription;
    }
    if (payload.seoSocialImageUrl !== undefined) {
        seoUpdate.seoSocialImageUrl = payload.seoSocialImageUrl;
    }
    if (Object.keys(seoUpdate).length === 0)
        return;
    await store_model_1.Store.findByIdAndUpdate(storeId, { $set: seoUpdate });
}
exports.getOnlineStorePreferencesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const preferences = await getOrCreatePreferences(storeId);
    return res.status(200).json({
        success: true,
        data: formatPreferencesResponse(preferences.toObject()),
        message: 'Online store preferences fetched',
    });
});
exports.updateOnlineStorePreferences = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const payload = extractPayload(req.body);
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid online store preferences id is required', 400);
    }
    const existing = await online_store_preferences_model_1.OnlineStorePreferences.findById(id);
    if (!existing) {
        throw new error_utils_1.CustomError('Online store preferences not found', 404);
    }
    const $set = { ...payload };
    const $unset = {};
    delete $set.storefrontPassword;
    if (payload.passwordProtectionEnabled === false) {
        $unset.storefrontPassword = '';
    }
    else if (payload.storefrontPassword) {
        $set.storefrontPassword = payload.storefrontPassword;
    }
    const updateQuery = { $set };
    if (Object.keys($unset).length > 0) {
        updateQuery.$unset = $unset;
    }
    const updated = await online_store_preferences_model_1.OnlineStorePreferences.findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true });
    if (!updated) {
        throw new error_utils_1.CustomError('Online store preferences not found', 404);
    }
    await syncStoreSeoFields(updated.storeId, payload);
    return res.status(200).json({
        success: true,
        data: formatPreferencesResponse(updated.toObject()),
        message: 'Online store preferences updated',
    });
});
