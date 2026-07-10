"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStoreCloudStorageUpload = exports.listStoreCloudStorageUploadsByStoreId = exports.registerStoreCloudStorageUpload = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_cloud_storage_model_1 = require("../models/store-cloud-storage/store-cloud-storage.model");
const error_utils_1 = require("../utils/error.utils");
const isDuplicateKeyError = (err) => typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 11000;
/**
 * After the client uploads via presigned URL (POST /api/aws/signed-url/image),
 * register that object key so it appears in Content → Files for the store.
 *
 * POST /api/store/cloud-storage/register
 * Body: { storeId, key }
 */
exports.registerStoreCloudStorageUpload = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, key } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    if (typeof key !== 'string' || !key.trim()) {
        throw new error_utils_1.CustomError('key is required (S3 object key from the upload response)', 400);
    }
    const trimmedKey = key.trim();
    try {
        const entry = await store_cloud_storage_model_1.StoreCloudStorage.create({ storeId, key: trimmedKey });
        return res.status(201).json({
            success: true,
            message: 'Upload registered for store',
            data: entry,
        });
    }
    catch (err) {
        if (isDuplicateKeyError(err)) {
            throw new error_utils_1.CustomError('This file is already registered for this store', 409);
        }
        throw err;
    }
});
/**
 * List every registered upload for a store (many documents per storeId).
 *
 * GET /api/store/cloud-storage/store/:storeId
 */
exports.listStoreCloudStorageUploadsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const uploads = await store_cloud_storage_model_1.StoreCloudStorage.find({ storeId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({
        success: true,
        message: uploads.length ? 'Store uploads fetched' : 'No uploads registered for this store',
        data: uploads,
        count: uploads.length,
    });
});
/**
 * Remove a registry entry (does not delete the S3 object — use /api/aws/delete-images for that).
 *
 * DELETE /api/store/cloud-storage/:id
 */
exports.deleteStoreCloudStorageUpload = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid upload id is required', 400);
    }
    const removed = await store_cloud_storage_model_1.StoreCloudStorage.findByIdAndDelete(id);
    if (!removed) {
        throw new error_utils_1.CustomError('Upload record not found', 404);
    }
    return res.status(200).json({
        success: true,
        message: 'Upload record removed',
        data: {
            id: removed._id,
            storeId: removed.storeId,
            key: removed.key,
        },
    });
});
