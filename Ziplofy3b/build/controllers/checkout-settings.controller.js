"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheckoutSettingsByStoreId = exports.updateCheckoutSettings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const checkout_settings_model_1 = require("../models/checkout-settings/checkout-settings.model");
const checkout_settings_email_region_model_1 = require("../models/checkout-settings/checkout-settings-email-region.model");
const formatCheckoutSettingsResponse = async (settingsId) => {
    const settings = await checkout_settings_model_1.CheckoutSettings.findById(settingsId).lean();
    if (!settings) {
        throw new error_utils_1.CustomError('Checkout settings not found', 404);
    }
    const regions = await checkout_settings_email_region_model_1.CheckoutSettingsEmailRegion.find({ checkoutSettingsId: settingsId })
        .select('countryId')
        .lean();
    return {
        ...settings,
        emailSelectedRegionIds: regions.map((region) => region.countryId),
    };
};
exports.updateCheckoutSettings = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { contactMethod, orderTracking, requireSignIn, marketing, tipping, checkoutLanguage, addressCollection, addToCartLimit, emailSelectedRegionIds = [], } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError('Invalid checkout settings id', 400);
    }
    const settings = await checkout_settings_model_1.CheckoutSettings.findById(id);
    if (!settings) {
        throw new error_utils_1.CustomError('Checkout settings not found', 404);
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        settings.contactMethod = contactMethod ?? settings.contactMethod;
        settings.orderTracking = {
            ...settings.orderTracking,
            ...orderTracking,
        };
        settings.requireSignIn = typeof requireSignIn === 'boolean' ? requireSignIn : settings.requireSignIn;
        settings.marketing = {
            email: {
                enabled: marketing?.email?.enabled ?? settings.marketing.email.enabled,
                regionMode: marketing?.email?.regionMode ?? settings.marketing.email.regionMode,
            },
            sms: {
                enabled: marketing?.sms?.enabled ?? settings.marketing.sms.enabled,
            },
        };
        settings.tipping = {
            enabled: tipping?.enabled ?? settings.tipping.enabled,
            presets: tipping?.presets ?? settings.tipping.presets,
            hideUntilSelected: tipping?.hideUntilSelected ?? settings.tipping.hideUntilSelected,
        };
        settings.checkoutLanguage = checkoutLanguage ?? settings.checkoutLanguage;
        settings.addressCollection = {
            useShippingAsBilling: addressCollection?.useShippingAsBilling ?? settings.addressCollection.useShippingAsBilling,
        };
        settings.addToCartLimit = {
            enabled: addToCartLimit?.enabled ?? settings.addToCartLimit.enabled,
            limit: typeof addToCartLimit?.limit === 'number' ? addToCartLimit.limit : settings.addToCartLimit.limit,
            useRecommended: addToCartLimit?.useRecommended ?? settings.addToCartLimit.useRecommended,
        };
        await settings.save({ session });
        const regionIds = Array.isArray(emailSelectedRegionIds)
            ? emailSelectedRegionIds
            : [];
        await checkout_settings_email_region_model_1.CheckoutSettingsEmailRegion.deleteMany({ checkoutSettingsId: settings._id }).session(session);
        if (regionIds.length) {
            const documents = regionIds.map((countryId) => ({
                checkoutSettingsId: settings._id,
                storeId: settings.storeId,
                countryId,
            }));
            await checkout_settings_email_region_model_1.CheckoutSettingsEmailRegion.insertMany(documents, { session });
        }
        await session.commitTransaction();
        session.endSession();
        const response = await formatCheckoutSettingsResponse(settings._id);
        res.status(200).json({ success: true, data: response });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.getCheckoutSettingsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError('Invalid store id', 400);
    }
    let settings = await checkout_settings_model_1.CheckoutSettings.findOne({ storeId });
    if (!settings) {
        settings = await checkout_settings_model_1.CheckoutSettings.create({ storeId });
    }
    const response = await formatCheckoutSettingsResponse(settings._id);
    res.status(200).json({ success: true, data: response });
});
