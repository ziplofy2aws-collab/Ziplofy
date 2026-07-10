import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreReturnRefundPolicy } from '../models/store-return-refund-policy/store-return-refund-policy.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /store-return-refund-policy
export const createStoreReturnRefundPolicy = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, returnRefundPolicy } = req.body as { storeId: string; returnRefundPolicy: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);
  if (typeof returnRefundPolicy !== 'string' || returnRefundPolicy.trim().length === 0) throw new CustomError('returnRefundPolicy is required', 400);

  const existing = await StoreReturnRefundPolicy.findOne({ storeId });
  if (existing) {
    existing.returnRefundPolicy = returnRefundPolicy;
    await existing.save();
    return res.status(200).json({ success: true, data: existing, message: 'Store return/refund policy updated' });
  }

  const created = await StoreReturnRefundPolicy.create({ storeId, returnRefundPolicy });
  return res.status(201).json({ success: true, data: created, message: 'Store return/refund policy created' });
});

// PUT /store-return-refund-policy/:id
export const updateStoreReturnRefundPolicy = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { returnRefundPolicy } = req.body as { returnRefundPolicy?: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const update: any = {};
  if (typeof returnRefundPolicy === 'string') update.returnRefundPolicy = returnRefundPolicy;

  const updated = await StoreReturnRefundPolicy.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!updated) throw new CustomError('Store return/refund policy not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Store return/refund policy updated' });
});

// GET /store-return-refund-policy/store/:storeId
export const getStoreReturnRefundPolicyByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);

  const policy = await StoreReturnRefundPolicy.findOne({ storeId });
  return res.status(200).json({ success: true, data: policy, message: policy ? 'Store return/refund policy fetched' : 'No return/refund policy found' });
});


