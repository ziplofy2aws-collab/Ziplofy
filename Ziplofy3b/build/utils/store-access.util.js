"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertStoreAccess = assertStoreAccess;
exports.assertStoreContentFileKey = assertStoreContentFileKey;
const store_model_1 = require("../models/store/store.model");
const error_utils_1 = require("./error.utils");
async function assertStoreAccess(storeId, user) {
    if (!user) {
        throw new error_utils_1.CustomError('Not authorized to access this route', 401);
    }
    if (user.superAdmin) {
        return;
    }
    const store = await store_model_1.Store.findById(storeId).select('userId').lean();
    if (!store) {
        throw new error_utils_1.CustomError('Store not found', 404);
    }
    if (store.userId.toString() !== user.id) {
        throw new error_utils_1.CustomError('You do not have permission to manage this store', 403);
    }
}
function assertStoreContentFileKey(storeId, key) {
    const expectedPrefix = `stores/${storeId}/content-files/`;
    if (!key.startsWith(expectedPrefix)) {
        throw new error_utils_1.CustomError('Invalid file key for this store', 400);
    }
}
