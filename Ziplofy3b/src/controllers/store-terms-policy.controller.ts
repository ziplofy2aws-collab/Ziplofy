import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreTermsPolicy } from '../models/store-terms-policy/store-terms-policy.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /store-terms-policy
export const createStoreTermsPolicy = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, termsPolicy } = req.body as { storeId: string; termsPolicy: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);
  if (typeof termsPolicy !== 'string' || termsPolicy.trim().length === 0) throw new CustomError('termsPolicy is required', 400);

  const existing = await StoreTermsPolicy.findOne({ storeId });
  if (existing) {
    existing.termsPolicy = termsPolicy;
    await existing.save();
    return res.status(200).json({ success: true, data: existing, message: 'Store terms policy updated' });
  }

  const created = await StoreTermsPolicy.create({ storeId, termsPolicy });
  return res.status(201).json({ success: true, data: created, message: 'Store terms policy created' });
});

// PUT /store-terms-policy/:id
export const updateStoreTermsPolicy = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { termsPolicy } = req.body as { termsPolicy?: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const update: any = {};
  if (typeof termsPolicy === 'string') update.termsPolicy = termsPolicy;

  const updated = await StoreTermsPolicy.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!updated) throw new CustomError('Store terms policy not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Store terms policy updated' });
});

// GET /store-terms-policy/store/:storeId
export const getStoreTermsPolicyByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);

  const info = await StoreTermsPolicy.findOne({ storeId });
  return res.status(200).json({ success: true, data: info, message: info ? 'Store terms policy fetched' : 'No terms policy found' });
});


