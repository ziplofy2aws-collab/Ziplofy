import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreBanner } from '../models/store-banner/store-banner.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

const parseImageUrls = (raw: unknown): string[] => {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) {
    throw new CustomError('imageUrls must be an array of strings', 400);
  }
  for (const u of raw) {
    if (typeof u !== 'string' || !u.trim()) {
      throw new CustomError('Each image URL must be a non-empty string', 400);
    }
  }
  return (raw as string[]).map((u) => u.trim());
};

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  'code' in err &&
  (err as { code: number }).code === 11000;

export const createStoreBanner = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, bannerGroupName, imageUrls } = req.body as {
    storeId?: string;
    bannerGroupName?: string;
    imageUrls?: unknown;
  };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  if (typeof bannerGroupName !== 'string' || !bannerGroupName.trim()) {
    throw new CustomError('bannerGroupName is required', 400);
  }

  const urls = parseImageUrls(imageUrls);

  try {
    const created = await StoreBanner.create({
      storeId,
      bannerGroupName: bannerGroupName.trim(),
      imageUrls: urls,
    });
    return res.status(201).json({
      success: true,
      data: created,
      message: 'Store banner created',
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new CustomError('A banner group with this name already exists for this store', 409);
    }
    throw err;
  }
});

export const updateStoreBanner = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid banner id is required', 400);
  }

  const body = req.body as { bannerGroupName?: string; imageUrls?: unknown };
  const payload: { bannerGroupName?: string; imageUrls?: string[] } = {};

  if (body.bannerGroupName !== undefined) {
    if (typeof body.bannerGroupName !== 'string' || !body.bannerGroupName.trim()) {
      throw new CustomError('bannerGroupName must be a non-empty string', 400);
    }
    payload.bannerGroupName = body.bannerGroupName.trim();
  }

  if (body.imageUrls !== undefined) {
    payload.imageUrls = parseImageUrls(body.imageUrls);
  }

  if (Object.keys(payload).length === 0) {
    throw new CustomError('Provide bannerGroupName and/or imageUrls to update', 400);
  }

  try {
    const updated = await StoreBanner.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });

    if (!updated) {
      throw new CustomError('Store banner not found', 404);
    }

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Store banner updated',
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new CustomError('A banner group with this name already exists for this store', 409);
    }
    throw err;
  }
});

export const getStoreBannersByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId?: string };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const banners = await StoreBanner.find({ storeId }).sort({ createdAt: -1 }).lean();

  return res.status(200).json({
    success: true,
    data: banners,
    message: banners.length ? 'Store banners fetched' : 'No banners found for this store',
  });
});
