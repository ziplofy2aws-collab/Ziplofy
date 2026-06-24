"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorefrontCheckoutConfigurationByStoreId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_checkout_configuration_model_1 = require("../models/store-checkout-configuration/store-checkout-configuration.model");
const error_utils_1 = require("../utils/error.utils");
/** Public storefront read — checkout UI settings only (no admin metadata). */
exports.getStorefrontCheckoutConfigurationByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const doc = await store_checkout_configuration_model_1.StoreCheckoutConfiguration.findOne({ storeId })
        .select('checkoutConfig storeId')
        .lean();
    res.status(200).json({
        success: true,
        message: doc
            ? 'Store checkout configuration retrieved'
            : 'No checkout configuration found for this store',
        data: doc
            ? {
                storeId: String(doc.storeId),
                checkoutConfig: doc.checkoutConfig ?? {},
            }
            : null,
    });
});
