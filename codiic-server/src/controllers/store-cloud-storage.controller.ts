import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { SecureUserInfo } from '../middlewares/auth.middleware';
import { StoreCloudStorage } from '../models/store-cloud-storage/store-cloud-storage.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { assertStoreAccess } from '../utils/store-access.util';
import { awsBucket, s3Client } from '../utils/s3-client';

const S3_DELETE_BATCH_SIZE = 1000;

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  'code' in err &&
  (err as { code: number }).code === 11000;

async function deleteS3KeysInBatches(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  for (let i = 0; i < keys.length; i += S3_DELETE_BATCH_SIZE) {
    const batch = keys.slice(i, i + S3_DELETE_BATCH_SIZE);
    const deleteResult = await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: awsBucket,
        Delete: {
          Objects: batch.map((key) => ({ Key: key })),
          Quiet: false,
        },
      })
    );

    const failedDeletes = (deleteResult.Errors || []).map((err) => ({
      key: err.Key,
      code: err.Code,
      message: err.Message,
    }));

    if (failedDeletes.length > 0) {
      const details = failedDeletes
        .map(
          (item) =>
            `${item.key || 'unknown-key'} [${item.code || 'UNKNOWN'}: ${item.message || 'No message'}]`
        )
        .join(', ');
      throw new CustomError(`Failed to delete one or more files from S3: ${details}`, 500);
    }
  }
}

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

/**
 * Delete every registered content file for a store from S3 and the database.
 *
 * DELETE /api/store/cloud-storage/store/:storeId
 */
export const deleteAllStoreCloudStorageUploads = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId?: string };

    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      throw new CustomError('Valid storeId is required', 400);
    }

    await assertStoreAccess(storeId, req.user as SecureUserInfo | undefined);

    const uploads = await StoreCloudStorage.find({ storeId }).select('key').lean();
    const keys = Array.from(
      new Set(
        uploads
          .map((upload) => (typeof upload.key === 'string' ? upload.key.trim() : ''))
          .filter(Boolean)
      )
    );

    await deleteS3KeysInBatches(keys);

    const deleteResult = await StoreCloudStorage.deleteMany({ storeId });

    return res.status(200).json({
      success: true,
      message:
        keys.length === 0
          ? 'No files to delete for this store'
          : `Deleted ${keys.length} file${keys.length === 1 ? '' : 's'} from S3 and the database`,
      data: {
        storeId,
        deletedFromS3: keys.length,
        deletedFromDatabase: deleteResult.deletedCount ?? 0,
      },
    });
  }
);