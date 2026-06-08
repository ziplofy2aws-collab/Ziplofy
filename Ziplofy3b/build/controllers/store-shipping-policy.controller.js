"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreShippingPolicyByStoreId = exports.updateStoreShippingPolicy = exports.createStoreShippingPolicy = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_shipping_policy_model_1 = require("../models/store-shipping-policy/store-shipping-policy.model");
const error_utils_1 = require("../utils/error.utils");
// POST /store-shipping-policy
exports.createStoreShippingPolicy = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, shippingPolicy } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    if (typeof shippingPolicy !== 'string' || shippingPolicy.trim().length === 0)
        throw new error_utils_1.CustomError('shippingPolicy is required', 400);
    const existing = await store_shipping_policy_model_1.StoreShippingPolicy.findOne({ storeId });
    if (existing) {
        existing.shippingPolicy = shippingPolicy;
        await existing.save();
        return res.status(200).json({ success: true, data: existing, message: 'Store shipping policy updated' });
    }
    const created = await store_shipping_policy_model_1.StoreShippingPolicy.create({ storeId, shippingPolicy });
    return res.status(201).json({ success: true, data: created, message: 'Store shipping policy created' });
});
// PUT /store-shipping-policy/:id
exports.updateStoreShippingPolicy = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { shippingPolicy } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const update = {};
    if (typeof shippingPolicy === 'string')
        update.shippingPolicy = shippingPolicy;
    const updated = await store_shipping_policy_model_1.StoreShippingPolicy.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Store shipping policy not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Store shipping policy updated' });
});
// GET /store-shipping-policy/store/:storeId
exports.getStoreShippingPolicyByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    const info = await store_shipping_policy_model_1.StoreShippingPolicy.findOne({ storeId });
    return res.status(200).json({ success: true, data: info, message: info ? 'Store shipping policy fetched' : 'No shipping policy found' });
});
