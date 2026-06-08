import { Router } from 'express';
import {
  deleteStoreCloudStorageUpload,
  listStoreCloudStorageUploadsByStoreId,
  registerStoreCloudStorageUpload,
} from '../controllers/store-cloud-storage.controller';
import { protect } from '../middlewares/auth.middleware';

const storeCloudStorageRouter = Router();

storeCloudStorageRouter.use(protect);

/** Register one uploaded file (after S3 PUT succeeds). */
storeCloudStorageRouter.post('/register', registerStoreCloudStorageUpload);

/** All registered uploads for a store. */
storeCloudStorageRouter.get('/store/:storeId', listStoreCloudStorageUploadsByStoreId);

/** Remove one registry row by Mongo _id. */
storeCloudStorageRouter.delete('/:id', deleteStoreCloudStorageUpload);

export default storeCloudStorageRouter;
