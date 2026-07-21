import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StorePrivacyPolicy } from '../models/store-privacy-policy/store-privacy-policy.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /store-privacy-policy
export const createStorePrivacyPolicy = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, privacyPolicy } = req.body as { storeId: string; privacyPolicy: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);
  if (typeof privacyPolicy !== 'string' || privacyPolicy.trim().length === 0) throw new CustomError('privacyPolicy is required', 400);

  const existing = await StorePrivacyPolicy.findOne({ storeId });
  if (existing) {
    existing.privacyPolicy = privacyPolicy;
    await existing.save();
    return res.status(200).json({ success: true, data: existing, message: 'Store privacy policy updated' });
  }

  const created = await StorePrivacyPolicy.create({ storeId, privacyPolicy });
  return res.status(201).json({ success: true, data: created, message: 'Store privacy policy created' });
});

// PUT /store-privacy-policy/:id
export const updateStorePrivacyPolicy = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { privacyPolicy } = req.body as { privacyPolicy?: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const update: any = {};
  if (typeof privacyPolicy === 'string') update.privacyPolicy = privacyPolicy;

  const updated = await StorePrivacyPolicy.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!updated) throw new CustomError('Store privacy policy not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Store privacy policy updated' });
});

// GET /store-privacy-policy/store/:storeId
export const getStorePrivacyPolicyByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);

  const policy = await StorePrivacyPolicy.findOne({ storeId });
  return res.status(200).json({ success: true, data: policy, message: policy ? 'Store privacy policy fetched' : 'No privacy policy found' });
});
