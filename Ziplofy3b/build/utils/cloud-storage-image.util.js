"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractStoreContentFileKey = extractStoreContentFileKey;
exports.assertOptionalStoreCloudImageUrl = assertOptionalStoreCloudImageUrl;
exports.assertStoreCloudImageUrls = assertStoreCloudImageUrls;
const mongoose_1 = __importDefault(require("mongoose"));
const store_cloud_storage_model_1 = require("../models/store-cloud-storage/store-cloud-storage.model");
const error_utils_1 = require("./error.utils");
function extractStoreContentFileKey(url, storeId) {
    const prefix = `stores/${storeId}/content-files/`;
    try {
        const parsed = new URL(url.trim());
        const path = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
        if (!path.startsWith(prefix))
            return null;
        return path;
    }
    catch {
        return null;
    }
}
async function assertOptionalStoreCloudImageUrl(storeId, url) {
    if (!url || !String(url).trim())
        return;
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const key = extractStoreContentFileKey(String(url), storeId);
    if (!key) {
        throw new error_utils_1.CustomError('Image must be chosen from store cloud files', 400);
    }
    const registered = await store_cloud_storage_model_1.StoreCloudStorage.findOne({ storeId, key }).select('_id').lean();
    if (!registered) {
        throw new error_utils_1.CustomError('Image is not registered in store cloud files', 400);
    }
}
async function assertStoreCloudImageUrls(storeId, urls) {
    if (!Array.isArray(urls) || !urls.length)
        return;
    for (const url of urls) {
        await assertOptionalStoreCloudImageUrl(storeId, url);
    }
}
