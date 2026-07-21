import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreBranding } from '../models/store-branding/store-branding.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

type StoreBrandingPayload = {
  defaultLogoUrl?: string;
  squareLogoUrl?: string;
  primaryColor?: string;
  contrastColor?: string;
  secondaryColors?: string[];
  secondaryContrastColor?: string;
  coverImageUrl?: string;
  slogan?: string;
  shortDescription?: string;
  socialLinks?: Record<string, string>;
};

const extractPayload = (body: any): StoreBrandingPayload => {
  const payload: StoreBrandingPayload = {};

  const assignIfDefined = (key: keyof StoreBrandingPayload) => {
    if (body[key] !== undefined) {
      payload[key] = body[key];
    }
  };

  assignIfDefined('defaultLogoUrl');
  assignIfDefined('squareLogoUrl');
  assignIfDefined('primaryColor');
  assignIfDefined('contrastColor');
  assignIfDefined('secondaryColors');
  assignIfDefined('secondaryContrastColor');
  assignIfDefined('coverImageUrl');
  assignIfDefined('slogan');
  assignIfDefined('shortDescription');
  assignIfDefined('socialLinks');

  if (payload.secondaryColors !== undefined && !Array.isArray(payload.secondaryColors)) {
    throw new CustomError('secondaryColors must be an array of hex strings', 400);
  }

  if (
    payload.socialLinks !== undefined &&
    (typeof payload.socialLinks !== 'object' || Array.isArray(payload.socialLinks))
  ) {
    throw new CustomError('socialLinks must be an object with platform keys and URL values', 400);
  }

  return payload;
};

export const createStoreBranding = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.body as { storeId?: string };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const payload = extractPayload(req.body);

  const existing = await StoreBranding.findOne({ storeId });

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return res.status(200).json({ success: true, data: existing, message: 'Store branding updated' });
  }

  const created = await StoreBranding.create({ storeId, ...payload });
  return res.status(201).json({ success: true, data: created, message: 'Store branding created' });
});

export const updateStoreBranding = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid branding id is required', 400);
  }

  const payload = extractPayload(req.body);

  const updated = await StoreBranding.findByIdAndUpdate(id, { $set: payload }, { new: true });

  if (!updated) {
    throw new CustomError('Store branding not found', 404);
  }

  return res.status(200).json({ success: true, data: updated, message: 'Store branding updated' });
});

export const getStoreBrandingByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId?: string };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const branding = await StoreBranding.findOne({ storeId });

  return res.status(200).json({
    success: true,
    data: branding,
    message: branding ? 'Store branding fetched' : 'No branding found for this store',
  });
});


