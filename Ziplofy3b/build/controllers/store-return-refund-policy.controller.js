"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreReturnRefundPolicyByStoreId = exports.updateStoreReturnRefundPolicy = exports.createStoreReturnRefundPolicy = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_return_refund_policy_model_1 = require("../models/store-return-refund-policy/store-return-refund-policy.model");
const error_utils_1 = require("../utils/error.utils");
// POST /store-return-refund-policy
exports.createStoreReturnRefundPolicy = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, returnRefundPolicy } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    if (typeof returnRefundPolicy !== 'string' || returnRefundPolicy.trim().length === 0)
        throw new error_utils_1.CustomError('returnRefundPolicy is required', 400);
    const existing = await store_return_refund_policy_model_1.StoreReturnRefundPolicy.findOne({ storeId });
    if (existing) {
        existing.returnRefundPolicy = returnRefundPolicy;
        await existing.save();
        return res.status(200).json({ success: true, data: existing, message: 'Store return/refund policy updated' });
    }
    const created = await store_return_refund_policy_model_1.StoreReturnRefundPolicy.create({ storeId, returnRefundPolicy });
    return res.status(201).json({ success: true, data: created, message: 'Store return/refund policy created' });
});
// PUT /store-return-refund-policy/:id
exports.updateStoreReturnRefundPolicy = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { returnRefundPolicy } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const update = {};
    if (typeof returnRefundPolicy === 'string')
        update.returnRefundPolicy = returnRefundPolicy;
    const updated = await store_return_refund_policy_model_1.StoreReturnRefundPolicy.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Store return/refund policy not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Store return/refund policy updated' });
});
// GET /store-return-refund-policy/store/:storeId
exports.getStoreReturnRefundPolicyByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    const policy = await store_return_refund_policy_model_1.StoreReturnRefundPolicy.findOne({ storeId });
    return res.status(200).json({ success: true, data: policy, message: policy ? 'Store return/refund policy fetched' : 'No return/refund policy found' });
});
