import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Catalog } from '../models/catalog/catalog.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /catalogs
export const createCatalog = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    storeId,
    title,
    status,
    currencyId,
    priceAdjustment,
    priceAdjustmentSide,
    includeCompareAtPrice,
    autoIncludeNewProducts,
  } = req.body as {
    storeId: string;
    title: string;
    status?: 'active' | 'draft';
    currencyId: string;
    priceAdjustment?: number;
    priceAdjustmentSide?: 'increase' | 'decrease';
    includeCompareAtPrice?: boolean;
    autoIncludeNewProducts?: boolean;
  };

  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);
  if (!currencyId || !mongoose.isValidObjectId(currencyId)) throw new CustomError('Valid currencyId is required', 400);
  if (!title || typeof title !== 'string' || !title.trim()) throw new CustomError('title is required', 400);

  const created = await Catalog.create({
    storeId,
    title: title.trim(),
    status: status || 'draft',
    currencyId,
    priceAdjustment: typeof priceAdjustment === 'number' ? priceAdjustment : 0,
    priceAdjustmentSide: priceAdjustmentSide || 'decrease',
    includeCompareAtPrice: Boolean(includeCompareAtPrice),
    autoIncludeNewProducts: Boolean(autoIncludeNewProducts),
  });
  return res.status(201).json({ success: true, data: created, message: 'Catalog created' });
});

// PUT /catalogs/:id
export const updateCatalog = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const {
    title,
    status,
    currencyId,
    priceAdjustment,
    priceAdjustmentSide,
    includeCompareAtPrice,
    autoIncludeNewProducts,
  } = req.body as Partial<{
    title: string;
    status: 'active' | 'draft';
    currencyId: string;
    priceAdjustment: number;
    priceAdjustmentSide: 'increase' | 'decrease';
    includeCompareAtPrice: boolean;
    autoIncludeNewProducts: boolean;
  }>;

  const update: any = {};
  if (typeof title === 'string') update.title = title.trim();
  if (status === 'active' || status === 'draft') update.status = status;
  if (currencyId && mongoose.isValidObjectId(currencyId)) update.currencyId = currencyId;
  if (typeof priceAdjustment === 'number') update.priceAdjustment = priceAdjustment;
  if (priceAdjustmentSide === 'increase' || priceAdjustmentSide === 'decrease') update.priceAdjustmentSide = priceAdjustmentSide;
  if (typeof includeCompareAtPrice === 'boolean') update.includeCompareAtPrice = includeCompareAtPrice;
  if (typeof autoIncludeNewProducts === 'boolean') update.autoIncludeNewProducts = autoIncludeNewProducts;

  const updated = await Catalog.findByIdAndUpdate(id, { $set: update }, { new: true });
  if (!updated) throw new CustomError('Catalog not found', 404);
  return res.status(200).json({ success: true, data: updated, message: 'Catalog updated' });
});

// DELETE /catalogs/:id
export const deleteCatalog = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);
  const deleted = await Catalog.findByIdAndDelete(id);
  if (!deleted) throw new CustomError('Catalog not found', 404);
  return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Catalog deleted' });
});

// GET /catalogs/store/:storeId
export const getCatalogsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new CustomError('Valid storeId is required', 400);
  const catalogs = await Catalog.find({ storeId }).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: catalogs, message: 'Catalogs fetched' });
});


