import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Pixel } from '../models';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

type PixelPayload = {
  pixelName?: string;
  type?: string;
  status?: string;
  required?: boolean;
  notRequired?: boolean;
  marketing?: boolean;
  analytics?: boolean;
  preferences?: boolean;
  dataSale?: string;
  code?: string;
};

const extractPayload = (body: any): PixelPayload => {
  const payload: PixelPayload = {};
  const keys: (keyof PixelPayload)[] = [
    'pixelName',
    'type',
    'status',
    'required',
    'notRequired',
    'marketing',
    'analytics',
    'preferences',
    'dataSale',
    'code',
  ];
  keys.forEach((k) => {
    if (body[k] !== undefined) payload[k] = body[k];
  });
  return payload;
};

export const createPixel = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.body as { storeId?: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  const payload = extractPayload(req.body);
  const created = await Pixel.create({ storeId, ...payload });
  return res.status(201).json({ success: true, data: created, message: 'Pixel created' });
});

export const updatePixel = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid pixel id is required', 400);
  }
  const payload = extractPayload(req.body);
  const updated = await Pixel.findByIdAndUpdate(id, { $set: payload }, { new: true });
  if (!updated) throw new CustomError('Pixel not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Pixel updated' });
});

export const deletePixel = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid pixel id is required', 400);
  }
  const deleted = await Pixel.findByIdAndDelete(id);
  if (!deleted) throw new CustomError('Pixel not found', 404);
  return res.status(200).json({ success: true, data: deleted, message: 'Pixel deleted' });
});

export const getPixelsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId?: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  const pixels = await Pixel.find({ storeId }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: pixels, message: 'Pixels fetched' });
});


