"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreBannersByStoreId = exports.updateStoreBanner = exports.createStoreBanner = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_banner_model_1 = require("../models/store-banner/store-banner.model");
const error_utils_1 = require("../utils/error.utils");
const parseImageUrls = (raw) => {
    if (raw === undefined)
        return [];
    if (!Array.isArray(raw)) {
        throw new error_utils_1.CustomError('imageUrls must be an array of strings', 400);
    }
    for (const u of raw) {
        if (typeof u !== 'string' || !u.trim()) {
            throw new error_utils_1.CustomError('Each image URL must be a non-empty string', 400);
        }
    }
    return raw.map((u) => u.trim());
};
const isDuplicateKeyError = (err) => typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 11000;
exports.createStoreBanner = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, bannerGroupName, imageUrls } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    if (typeof bannerGroupName !== 'string' || !bannerGroupName.trim()) {
        throw new error_utils_1.CustomError('bannerGroupName is required', 400);
    }
    const urls = parseImageUrls(imageUrls);
    try {
        const created = await store_banner_model_1.StoreBanner.create({
            storeId,
            bannerGroupName: bannerGroupName.trim(),
            imageUrls: urls,
        });
        return res.status(201).json({
            success: true,
            data: created,
            message: 'Store banner created',
        });
    }
    catch (err) {
        if (isDuplicateKeyError(err)) {
            throw new error_utils_1.CustomError('A banner group with this name already exists for this store', 409);
        }
        throw err;
    }
});
exports.updateStoreBanner = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid banner id is required', 400);
    }
    const body = req.body;
    const payload = {};
    if (body.bannerGroupName !== undefined) {
        if (typeof body.bannerGroupName !== 'string' || !body.bannerGroupName.trim()) {
            throw new error_utils_1.CustomError('bannerGroupName must be a non-empty string', 400);
        }
        payload.bannerGroupName = body.bannerGroupName.trim();
    }
    if (body.imageUrls !== undefined) {
        payload.imageUrls = parseImageUrls(body.imageUrls);
    }
    if (Object.keys(payload).length === 0) {
        throw new error_utils_1.CustomError('Provide bannerGroupName and/or imageUrls to update', 400);
    }
    try {
        const updated = await store_banner_model_1.StoreBanner.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
        if (!updated) {
            throw new error_utils_1.CustomError('Store banner not found', 404);
        }
        return res.status(200).json({
            success: true,
            data: updated,
            message: 'Store banner updated',
        });
    }
    catch (err) {
        if (isDuplicateKeyError(err)) {
            throw new error_utils_1.CustomError('A banner group with this name already exists for this store', 409);
        }
        throw err;
    }
});
exports.getStoreBannersByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const banners = await store_banner_model_1.StoreBanner.find({ storeId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
        success: true,
        data: banners,
        message: banners.length ? 'Store banners fetched' : 'No banners found for this store',
    });
});
