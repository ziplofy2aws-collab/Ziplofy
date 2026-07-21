import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { ShippingProfileProductVariantsEntry } from '../models/shipping-profile/shipping-profile-product-variants-entry.model';
import { ShippingProfile } from '../models/shipping-profile/shipping-profile.model';
import { ProductVariant } from '../models/product/product-variants.model';

export const getShippingProfileProductVariantEntries = asyncErrorHandler(async (req: Request, res: Response) => {
  const { profileId } = req.params;

  if (!profileId || !mongoose.isValidObjectId(profileId)) {
    throw new CustomError('Valid shipping profile ID is required', 400);
  }

  const profile = await ShippingProfile.findById(profileId).select('_id').lean();
  if (!profile) {
    throw new CustomError('Shipping profile not found', 404);
  }

  const entries = await ShippingProfileProductVariantsEntry.find({ shippingProfileId: profileId })
    .populate({
      path: 'productVariantId',
      populate: {
        path: 'productId',
        select: 'title imageUrls',
      },
    })
    .lean();

  return res.status(200).json({
    success: true,
    data: entries,
    message: 'Shipping profile product variants fetched successfully',
    meta: {
      shippingProfileId: profileId,
      total: entries.length,
    },
  });
});

export const createShippingProfileProductVariantEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const { productVariantId } = req.body;

  if (!profileId || !mongoose.isValidObjectId(profileId)) {
    throw new CustomError('Valid shipping profile ID is required', 400);
  }

  if (!productVariantId || !mongoose.isValidObjectId(productVariantId)) {
    throw new CustomError('Valid productVariantId is required', 400);
  }

  const profile = await ShippingProfile.findById(profileId).lean();
  if (!profile) {
    throw new CustomError('Shipping profile not found', 404);
  }

  const variant = await ProductVariant.findById(productVariantId)
    .populate('productId', 'storeId')
    .lean();
  if (!variant) {
    throw new CustomError('Product variant not found', 404);
  }

  const product = variant.productId as any;
  if (!product || String(product.storeId) !== String(profile.storeId)) {
    throw new CustomError('Product variant does not belong to this store', 403);
  }

  const entry = await ShippingProfileProductVariantsEntry.create({
    shippingProfileId: profileId,
    productVariantId,
    storeId: profile.storeId,
  });

  const populatedEntry = await ShippingProfileProductVariantsEntry.findById(entry._id)
    .populate({
      path: 'productVariantId',
      populate: {
        path: 'productId',
        select: 'title imageUrls',
      },
    })
    .lean();

  return res.status(201).json({
    success: true,
    data: populatedEntry,
    message: 'Product variant added to shipping profile',
    meta: {
      shippingProfileId: profileId,
    },
  });
});

export const deleteShippingProfileProductVariantEntry = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid entry ID is required', 400);
  }

  const entry = await ShippingProfileProductVariantsEntry.findById(id).lean();
  if (!entry) {
    throw new CustomError('Shipping profile product variant entry not found', 404);
  }

  await ShippingProfileProductVariantsEntry.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    data: { deletedId: id },
    message: 'Product variant removed from shipping profile',
    meta: {
      shippingProfileId: String(entry.shippingProfileId),
    },
  });
});

