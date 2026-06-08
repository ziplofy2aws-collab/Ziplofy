"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_cloud_storage_controller_1 = require("../controllers/store-cloud-storage.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const storeCloudStorageRouter = (0, express_1.Router)();
storeCloudStorageRouter.use(auth_middleware_1.protect);
/** Register one uploaded file (after S3 PUT succeeds). */
storeCloudStorageRouter.post('/register', store_cloud_storage_controller_1.registerStoreCloudStorageUpload);
/** All registered uploads for a store. */
storeCloudStorageRouter.get('/store/:storeId', store_cloud_storage_controller_1.listStoreCloudStorageUploadsByStoreId);
/** Remove one registry row by Mongo _id. */
storeCloudStorageRouter.delete('/:id', store_cloud_storage_controller_1.deleteStoreCloudStorageUpload);
exports.default = storeCloudStorageRouter;
