"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreBrandingByStoreId = exports.updateStoreBranding = exports.createStoreBranding = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_branding_model_1 = require("../models/store-branding/store-branding.model");
const error_utils_1 = require("../utils/error.utils");
const extractPayload = (body) => {
    const payload = {};
    const assignIfDefined = (key) => {
        if (body[key] !== undefined) {
            payload[key] = body[key];
        }
    };
    assignIfDefined('defaultLogoUrl');
    assignIfDefined('squareLogoUrl');
    assignIfDefined('primaryColor');
    assignIfDefined('contrastColor');
    assignIfDefined('secondaryColors');
    assignIfDefined('secondaryContrastColor');
    assignIfDefined('coverImageUrl');
    assignIfDefined('slogan');
    assignIfDefined('shortDescription');
    assignIfDefined('socialLinks');
    if (payload.secondaryColors !== undefined && !Array.isArray(payload.secondaryColors)) {
        throw new error_utils_1.CustomError('secondaryColors must be an array of hex strings', 400);
    }
    if (payload.socialLinks !== undefined &&
        (typeof payload.socialLinks !== 'object' || Array.isArray(payload.socialLinks))) {
        throw new error_utils_1.CustomError('socialLinks must be an object with platform keys and URL values', 400);
    }
    return payload;
};
exports.createStoreBranding = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const payload = extractPayload(req.body);
    const existing = await store_branding_model_1.StoreBranding.findOne({ storeId });
    if (existing) {
        Object.assign(existing, payload);
        await existing.save();
        return res.status(200).json({ success: true, data: existing, message: 'Store branding updated' });
    }
    const created = await store_branding_model_1.StoreBranding.create({ storeId, ...payload });
    return res.status(201).json({ success: true, data: created, message: 'Store branding created' });
});
exports.updateStoreBranding = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid branding id is required', 400);
    }
    const payload = extractPayload(req.body);
    const updated = await store_branding_model_1.StoreBranding.findByIdAndUpdate(id, { $set: payload }, { new: true });
    if (!updated) {
        throw new error_utils_1.CustomError('Store branding not found', 404);
    }
    return res.status(200).json({ success: true, data: updated, message: 'Store branding updated' });
});
exports.getStoreBrandingByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const branding = await store_branding_model_1.StoreBranding.findOne({ storeId });
    return res.status(200).json({
        success: true,
        data: branding,
        message: branding ? 'Store branding fetched' : 'No branding found for this store',
    });
});
