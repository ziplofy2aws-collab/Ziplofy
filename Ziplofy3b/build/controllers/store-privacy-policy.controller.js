"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorePrivacyPolicyByStoreId = exports.updateStorePrivacyPolicy = exports.createStorePrivacyPolicy = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_privacy_policy_model_1 = require("../models/store-privacy-policy/store-privacy-policy.model");
const error_utils_1 = require("../utils/error.utils");
// POST /store-privacy-policy
exports.createStorePrivacyPolicy = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, privacyPolicy } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    if (typeof privacyPolicy !== 'string' || privacyPolicy.trim().length === 0)
        throw new error_utils_1.CustomError('privacyPolicy is required', 400);
    const existing = await store_privacy_policy_model_1.StorePrivacyPolicy.findOne({ storeId });
    if (existing) {
        existing.privacyPolicy = privacyPolicy;
        await existing.save();
        return res.status(200).json({ success: true, data: existing, message: 'Store privacy policy updated' });
    }
    const created = await store_privacy_policy_model_1.StorePrivacyPolicy.create({ storeId, privacyPolicy });
    return res.status(201).json({ success: true, data: created, message: 'Store privacy policy created' });
});
// PUT /store-privacy-policy/:id
exports.updateStorePrivacyPolicy = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { privacyPolicy } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const update = {};
    if (typeof privacyPolicy === 'string')
        update.privacyPolicy = privacyPolicy;
    const updated = await store_privacy_policy_model_1.StorePrivacyPolicy.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Store privacy policy not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Store privacy policy updated' });
});
// GET /store-privacy-policy/store/:storeId
exports.getStorePrivacyPolicyByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    const policy = await store_privacy_policy_model_1.StorePrivacyPolicy.findOne({ storeId });
    return res.status(200).json({ success: true, data: policy, message: policy ? 'Store privacy policy fetched' : 'No privacy policy found' });
});
