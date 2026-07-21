import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreCloudStorage } from '../models/store-cloud-storage/store-cloud-storage.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  'code' in err &&
  (err as { code: number }).code === 11000;

/**
 * After the client uploads via presigned URL (POST /api/aws/signed-url/image),
 * register that object key so it appears in Content → Files for the store.
 *
 * POST /api/store/cloud-storage/register
 * Body: { storeId, key }
 */
export const registerStoreCloudStorageUpload = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, key } = req.body as { storeId?: string; key?: string };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  if (typeof key !== 'string' || !key.trim()) {
    throw new CustomError('key is required (S3 object key from the upload response)', 400);
  }

  const trimmedKey = key.trim();

  try {
    const entry = await StoreCloudStorage.create({ storeId, key: trimmedKey });
    return res.status(201).json({
      success: true,
      message: 'Upload registered for store',
      data: entry,
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new CustomError('This file is already registered for this store', 409);
    }
    throw err;
  }
});

/**
 * List every registered upload for a store (many documents per storeId).
 *
 * GET /api/store/cloud-storage/store/:storeId
 */
export const listStoreCloudStorageUploadsByStoreId = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId?: string };

    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      throw new CustomError('Valid storeId is required', 400);
    }

    const uploads = await StoreCloudStorage.find({ storeId }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      message: uploads.length ? 'Store uploads fetched' : 'No uploads registered for this store',
      data: uploads,
      count: uploads.length,
    });
  }
);

/**
 * Remove a registry entry (does not delete the S3 object — use /api/aws/delete-images for that).
 *
 * DELETE /api/store/cloud-storage/:id
 */
export const deleteStoreCloudStorageUpload = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid upload id is required', 400);
  }

  const removed = await StoreCloudStorage.findByIdAndDelete(id);

  if (!removed) {
    throw new CustomError('Upload record not found', 404);
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
