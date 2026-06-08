"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreTermsPolicyByStoreId = exports.updateStoreTermsPolicy = exports.createStoreTermsPolicy = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_terms_policy_model_1 = require("../models/store-terms-policy/store-terms-policy.model");
const error_utils_1 = require("../utils/error.utils");
// POST /store-terms-policy
exports.createStoreTermsPolicy = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, termsPolicy } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    if (typeof termsPolicy !== 'string' || termsPolicy.trim().length === 0)
        throw new error_utils_1.CustomError('termsPolicy is required', 400);
    const existing = await store_terms_policy_model_1.StoreTermsPolicy.findOne({ storeId });
    if (existing) {
        existing.termsPolicy = termsPolicy;
        await existing.save();
        return res.status(200).json({ success: true, data: existing, message: 'Store terms policy updated' });
    }
    const created = await store_terms_policy_model_1.StoreTermsPolicy.create({ storeId, termsPolicy });
    return res.status(201).json({ success: true, data: created, message: 'Store terms policy created' });
});
// PUT /store-terms-policy/:id
exports.updateStoreTermsPolicy = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { termsPolicy } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const update = {};
    if (typeof termsPolicy === 'string')
        update.termsPolicy = termsPolicy;
    const updated = await store_terms_policy_model_1.StoreTermsPolicy.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Store terms policy not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Store terms policy updated' });
});
// GET /store-terms-policy/store/:storeId
exports.getStoreTermsPolicyByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    const info = await store_terms_policy_model_1.StoreTermsPolicy.findOne({ storeId });
    return res.status(200).json({ success: true, data: info, message: info ? 'Store terms policy fetched' : 'No terms policy found' });
});
