import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreShippingPolicy } from '../models/store-shipping-policy/store-shipping-policy.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /store-shipping-policy
export const createStoreShippingPolicy = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, shippingPolicy } = req.body as { storeId: string; shippingPolicy: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);
  if (typeof shippingPolicy !== 'string' || shippingPolicy.trim().length === 0) throw new CustomError('shippingPolicy is required', 400);

  const existing = await StoreShippingPolicy.findOne({ storeId });
  if (existing) {
    existing.shippingPolicy = shippingPolicy;
    await existing.save();
    return res.status(200).json({ success: true, data: existing, message: 'Store shipping policy updated' });
  }

  const created = await StoreShippingPolicy.create({ storeId, shippingPolicy });
  return res.status(201).json({ success: true, data: created, message: 'Store shipping policy created' });
});

// PUT /store-shipping-policy/:id
export const updateStoreShippingPolicy = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { shippingPolicy } = req.body as { shippingPolicy?: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const update: any = {};
  if (typeof shippingPolicy === 'string') update.shippingPolicy = shippingPolicy;

  const updated = await StoreShippingPolicy.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!updated) throw new CustomError('Store shipping policy not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Store shipping policy updated' });
});

// GET /store-shipping-policy/store/:storeId
export const getStoreShippingPolicyByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);

  const info = await StoreShippingPolicy.findOne({ storeId });
  return res.status(200).json({ success: true, data: info, message: info ? 'Store shipping policy fetched' : 'No shipping policy found' });
});


