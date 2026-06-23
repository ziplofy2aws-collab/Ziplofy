"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStoreCheckoutConfiguration = exports.updateStoreCheckoutConfiguration = exports.getStoreCheckoutConfigurationById = exports.getStoreCheckoutConfigurationByStoreId = exports.createStoreCheckoutConfiguration = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_checkout_configuration_model_1 = require("../models/store-checkout-configuration/store-checkout-configuration.model");
const error_utils_1 = require("../utils/error.utils");
function parseCheckoutConfig(raw) {
    if (raw === null || raw === undefined) {
        throw new error_utils_1.CustomError('checkoutConfig is required', 400);
    }
    if (typeof raw !== 'object' || Array.isArray(raw)) {
        throw new error_utils_1.CustomError('checkoutConfig must be a JSON object', 400);
    }
    return raw;
}
exports.createStoreCheckoutConfiguration = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, checkoutConfig } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const existing = await store_checkout_configuration_model_1.StoreCheckoutConfiguration.findOne({ storeId }).lean();
    if (existing) {
        throw new error_utils_1.CustomError('Checkout configuration already exists for this store', 409);
    }
    const config = parseCheckoutConfig(checkoutConfig ?? {});
    const created = await store_checkout_configuration_model_1.StoreCheckoutConfiguration.create({
        storeId,
        checkoutConfig: config,
    });
    res.status(201).json({
        success: true,
        message: 'Store checkout configuration created',
        data: created,
    });
});
exports.getStoreCheckoutConfigurationByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const doc = await store_checkout_configuration_model_1.StoreCheckoutConfiguration.findOne({ storeId }).lean();
    res.status(200).json({
        success: true,
        message: doc
            ? 'Store checkout configuration retrieved'
            : 'No checkout configuration found for this store',
        data: doc,
    });
});
exports.getStoreCheckoutConfigurationById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid id is required', 400);
    }
    const doc = await store_checkout_configuration_model_1.StoreCheckoutConfiguration.findById(id).lean();
    if (!doc) {
        throw new error_utils_1.CustomError('Store checkout configuration not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'Store checkout configuration retrieved',
        data: doc,
    });
});
exports.updateStoreCheckoutConfiguration = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { checkoutConfig } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid id is required', 400);
    }
    if (checkoutConfig === undefined) {
        throw new error_utils_1.CustomError('checkoutConfig is required to update', 400);
    }
    const updated = await store_checkout_configuration_model_1.StoreCheckoutConfiguration.findByIdAndUpdate(id, { $set: { checkoutConfig: parseCheckoutConfig(checkoutConfig) } }, { new: true, runValidators: true });
    if (!updated) {
        throw new error_utils_1.CustomError('Store checkout configuration not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'Store checkout configuration updated',
        data: updated,
    });
});
exports.deleteStoreCheckoutConfiguration = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid id is required', 400);
    }
    const deleted = await store_checkout_configuration_model_1.StoreCheckoutConfiguration.findByIdAndDelete(id);
    if (!deleted) {
        throw new error_utils_1.CustomError('Store checkout configuration not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'Store checkout configuration deleted',
        data: { deletedId: id },
    });
});
