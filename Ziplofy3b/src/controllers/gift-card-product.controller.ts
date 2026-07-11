import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  GiftCardProduct,
  type GiftCardProductStatus,
  type GiftCardRedemptionScope,
} from '../models/gift-cards/gift-card-product.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

function slugifyHandle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeDenominations(values: unknown): number[] {
  if (!Array.isArray(values)) {
    throw new CustomError('denominations must be an array of positive numbers', 400);
  }

  const parsed = values
    .map((value) => (typeof value === 'string' ? parseFloat(value) : Number(value)))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!parsed.length) {
    throw new CustomError('At least one valid denomination is required', 400);
  }

  return parsed;
}

function normalizeRedemptionScope(value: unknown): GiftCardRedemptionScope {
  if (value === 'store' || value === 'store_currency') return 'store_currency';
  return 'all_currencies';
}

type CreateGiftCardProductBody = {
  storeId: string;
  title: string;
  description?: string;
  imageUrls?: string[];
  denominations: number[] | string[];
  storeCurrencyCode?: string;
  redemptionScope?: string;
  status?: GiftCardProductStatus;
  pageTitle?: string;
  metaDescription?: string;
  urlHandle?: string;
  productType?: string | null;
  vendor?: string | null;
  tagIds?: string[];
  themeTemplate?: string;
  giftCardTemplate?: string;
};

export const createGiftCardProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateGiftCardProductBody;

  if (!body.storeId || !body.title?.trim()) {
    throw new CustomError('storeId and title are required', 400);
  }

  if (!mongoose.isValidObjectId(body.storeId)) {
    throw new CustomError('Invalid storeId', 400);
  }

  const denominations = normalizeDenominations(body.denominations);
  const urlHandle =
    (body.urlHandle || '').trim() ||
    slugifyHandle(body.title) ||
    `gift-card-product-${Date.now()}`;

  const giftCardProduct = await GiftCardProduct.create({
    storeId: body.storeId,
    title: body.title.trim(),
    description: body.description?.trim() || '',
    imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : [],
    denominations,
    storeCurrencyCode: body.storeCurrencyCode?.trim() || 'INR',
    redemptionScope: normalizeRedemptionScope(body.redemptionScope),
    status: body.status === 'active' ? 'active' : 'draft',
    pageTitle: body.pageTitle?.trim() || body.title.trim(),
    metaDescription: body.metaDescription?.trim() || '',
    urlHandle,
    productType:
      body.productType && mongoose.isValidObjectId(body.productType) ? body.productType : null,
    vendor: body.vendor && mongoose.isValidObjectId(body.vendor) ? body.vendor : null,
    tagIds: Array.isArray(body.tagIds)
      ? body.tagIds.filter((id) => mongoose.isValidObjectId(id))
      : [],
    themeTemplate: body.themeTemplate?.trim() || 'default-product',
    giftCardTemplate: body.giftCardTemplate?.trim() || 'gift_card',
  });

  res.status(201).json({
    success: true,
    data: giftCardProduct,
    message: 'Gift card product created successfully',
  });
});

export const getGiftCardProductsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId) {
    throw new CustomError('storeId is required', 400);
  }

  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Invalid storeId', 400);
  }

  const products = await GiftCardProduct.find({ storeId, isDeleted: false }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: products,
    count: products.length,
  });
});

export const getGiftCardProductById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid gift card product id', 400);
  }

  const product = await GiftCardProduct.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new CustomError('Gift card product not found', 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const updateGiftCardProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as Partial<CreateGiftCardProductBody>;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid gift card product id', 400);
  }

  const existing = await GiftCardProduct.findOne({ _id: id, isDeleted: false });
  if (!existing) {
    throw new CustomError('Gift card product not found', 404);
  }

  const update: Record<string, unknown> = {};

  if (body.title !== undefined) update.title = body.title.trim();
  if (body.description !== undefined) update.description = body.description.trim();
  if (body.imageUrls !== undefined) update.imageUrls = body.imageUrls;
  if (body.denominations !== undefined) update.denominations = normalizeDenominations(body.denominations);
  if (body.storeCurrencyCode !== undefined) update.storeCurrencyCode = body.storeCurrencyCode.trim();
  if (body.redemptionScope !== undefined) update.redemptionScope = normalizeRedemptionScope(body.redemptionScope);
  if (body.status !== undefined) update.status = body.status === 'active' ? 'active' : 'draft';
  if (body.pageTitle !== undefined) update.pageTitle = body.pageTitle.trim();
  if (body.metaDescription !== undefined) update.metaDescription = body.metaDescription.trim();
  if (body.urlHandle !== undefined) update.urlHandle = body.urlHandle.trim();
  if (body.productType !== undefined) {
    update.productType =
      body.productType && mongoose.isValidObjectId(body.productType) ? body.productType : null;
  }
  if (body.vendor !== undefined) {
    update.vendor = body.vendor && mongoose.isValidObjectId(body.vendor) ? body.vendor : null;
  }
  if (body.tagIds !== undefined) {
    update.tagIds = Array.isArray(body.tagIds)
      ? body.tagIds.filter((tagId) => mongoose.isValidObjectId(tagId))
      : [];
  }
  if (body.themeTemplate !== undefined) update.themeTemplate = body.themeTemplate.trim();
  if (body.giftCardTemplate !== undefined) update.giftCardTemplate = body.giftCardTemplate.trim();

  const product = await GiftCardProduct.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
    message: 'Gift card product updated successfully',
  });
});

export const deleteGiftCardProduct = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid gift card product id', 400);
  }

  const product = await GiftCardProduct.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!product) {
    throw new CustomError('Gift card product not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { id: product._id },
    message: 'Gift card product deleted successfully',
  });
});
