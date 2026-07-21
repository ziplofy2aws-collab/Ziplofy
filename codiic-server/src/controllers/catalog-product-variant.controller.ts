import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { CatalogProductVariant } from '../models/catalog-product-variant/catalog-product-variant.model';

// PUT /catalog-product-variants/:id
export const updateCatalogProductVariant = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const { price, compareAtPrice } = req.body as { price?: number; compareAtPrice?: number };

  // Only allow editable fields
  const update: Record<string, unknown> = {};
  if (typeof price === 'number') update.price = price;
  if (typeof compareAtPrice === 'number') update.compareAtPrice = compareAtPrice;

  if (Object.keys(update).length === 0) {
    throw new CustomError('Nothing to update', 400);
  }

  const updated = await CatalogProductVariant.findByIdAndUpdate(id, update, { new: true });
  if (!updated) throw new CustomError('Catalog product variant not found', 404);

  return res.status(200).json({ success: true, data: updated, message: 'Catalog product variant updated' });
});


