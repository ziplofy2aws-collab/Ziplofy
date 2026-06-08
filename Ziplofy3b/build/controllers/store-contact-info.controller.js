"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreContactInfoByStoreId = exports.updateStoreContactInfo = exports.createStoreContactInfo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_contact_info_model_1 = require("../models/store-contact-info/store-contact-info.model");
const error_utils_1 = require("../utils/error.utils");
// POST /store-contact-info
exports.createStoreContactInfo = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, contactInfo } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    if (typeof contactInfo !== 'string' || contactInfo.trim().length === 0)
        throw new error_utils_1.CustomError('contactInfo is required', 400);
    // Ensure one-per-store semantics (upsert-like create)
    const existing = await store_contact_info_model_1.StoreContactInfo.findOne({ storeId });
    if (existing) {
        existing.contactInfo = contactInfo;
        await existing.save();
        return res.status(200).json({ success: true, data: existing, message: 'Store contact info updated' });
    }
    const created = await store_contact_info_model_1.StoreContactInfo.create({ storeId, contactInfo });
    return res.status(201).json({ success: true, data: created, message: 'Store contact info created' });
});
// PUT /store-contact-info/:id
exports.updateStoreContactInfo = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { contactInfo } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const update = {};
    if (typeof contactInfo === 'string')
        update.contactInfo = contactInfo;
    const updated = await store_contact_info_model_1.StoreContactInfo.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Store contact info not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Store contact info updated' });
});
// GET /store-contact-info/store/:storeId
exports.getStoreContactInfoByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    const info = await store_contact_info_model_1.StoreContactInfo.findOne({ storeId });
    return res.status(200).json({ success: true, data: info, message: info ? 'Store contact info fetched' : 'No contact info found' });
});
