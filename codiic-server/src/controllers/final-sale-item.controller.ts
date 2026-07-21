import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { FinalSaleItem } from '../models/final-sale-item/final-sale-item.model';
import { ReturnRules } from '../models/return-rules/return-rules.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /final-sale-items
export const createFinalSaleItem = asyncErrorHandler(async (req: Request, res: Response) => {
  const body = req.body as { returnRulesId: string; storeId: string; productVariantId?: string | null; collectionId?: string | null };
  if (!body?.returnRulesId || !mongoose.isValidObjectId(body.returnRulesId)) throw new CustomError('Valid returnRulesId is required', 400);
  if (!body?.storeId || !mongoose.isValidObjectId(body.storeId)) throw new CustomError('Valid storeId is required', 400);
  if (!body.productVariantId && !body.collectionId) throw new CustomError('Either productVariantId or collectionId must be provided', 400);

  if (body.productVariantId) {
    if (!mongoose.isValidObjectId(body.productVariantId)) throw new CustomError('Valid productVariantId is required', 400);
    const existing = await FinalSaleItem.findOne({
      returnRulesId: body.returnRulesId,
      productVariantId: body.productVariantId,
    });
    if (existing) throw new CustomError('This product variant is already marked as final sale', 409);
  }

  if (body.collectionId) {
    if (!mongoose.isValidObjectId(body.collectionId)) throw new CustomError('Valid collectionId is required', 400);
    const existing = await FinalSaleItem.findOne({
      returnRulesId: body.returnRulesId,
      collectionId: body.collectionId,
    });
    if (existing) throw new CustomError('This collection is already marked as final sale', 409);
  }

  const doc = await FinalSaleItem.create({
    returnRulesId: body.returnRulesId,
    storeId: body.storeId,
    productVariantId: body.productVariantId || null,
    collectionId: body.collectionId || null,
  });

  return res.status(201).json({ success: true, data: doc, message: 'Final sale item created' });
});

// DELETE /final-sale-items/:id
export const deleteFinalSaleItem = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || !mongoose.isValidObjectId(id)) throw new CustomError('Valid id is required', 400);

  const deleted = await FinalSaleItem.findByIdAndDelete(id);
  if (!deleted) throw new CustomError('Final sale item not found', 404);
  return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Final sale item deleted' });
});

// GET /final-sale-items/return-rules/:returnRulesId
export const getFinalSaleItemsByReturnRulesId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { returnRulesId } = req.params as { returnRulesId: string };
  if (!returnRulesId || !mongoose.isValidObjectId(returnRulesId)) throw new CustomError('Valid returnRulesId is required', 400);

  const rule = await ReturnRules.findById(returnRulesId).select({ finalSaleSelection: 1 });
  const selection: 'collections' | 'products' = rule?.finalSaleSelection === 'products' ? 'products' : 'collections';

  const filter: Record<string, any> = { returnRulesId };
  if (selection === 'collections') {
    filter.collectionId = { $ne: null };
    filter.productVariantId = null;
  } else {
    filter.productVariantId = { $ne: null };
    filter.collectionId = null;
  }

  let query = FinalSaleItem.find(filter).sort({ createdAt: -1 });
  if (selection === 'collections') {
    query = query.populate('collectionId', 'title image');
  } else {
    query = query.populate({
      path: 'productVariantId',
      populate: { path: 'productId', select: 'title imageUrls' },
    });
  }

  const items = await query;
  return res.status(200).json({ success: true, data: items, message: 'Final sale items fetched' });
});


