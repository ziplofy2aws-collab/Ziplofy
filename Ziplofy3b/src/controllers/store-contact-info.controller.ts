import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreContactInfo } from '../models/store-contact-info/store-contact-info.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /store-contact-info
export const createStoreContactInfo = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, contactInfo } = req.body as { storeId: string; contactInfo: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);
  if (typeof contactInfo !== 'string' || contactInfo.trim().length === 0) throw new CustomError('contactInfo is required', 400);

  // Ensure one-per-store semantics (upsert-like create)
  const existing = await StoreContactInfo.findOne({ storeId });
  if (existing) {
    existing.contactInfo = contactInfo;
    await existing.save();
    return res.status(200).json({ success: true, data: existing, message: 'Store contact info updated' });
  }

  const created = await StoreContactInfo.create({ storeId, contactInfo });
  return res.status(201).json({ success: true, data: created, message: 'Store contact info created' });
});

// PUT /store-contact-info/:id
export const updateStoreContactInfo = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { contactInfo } = req.body as { contactInfo?: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);
  const update: any = {};
  if (typeof contactInfo === 'string') update.contactInfo = contactInfo;

  const updated = await StoreContactInfo.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!updated) throw new CustomError('Store contact info not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Store contact info updated' });
});

// GET /store-contact-info/store/:storeId
export const getStoreContactInfoByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);

  const info = await StoreContactInfo.findOne({ storeId });
  return res.status(200).json({ success: true, data: info, message: info ? 'Store contact info fetched' : 'No contact info found' });
});


