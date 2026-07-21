import { Request, RequestHandler, Response } from 'express';
import mongoose from 'mongoose';
import { InventoryLevelModel } from '../models/inventory-level/inventory-level.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// Get inventory levels by location ID (all variants at a location)
export const getInventoryLevelsByLocation = asyncErrorHandler(async (req: Request, res: Response) => {
  const { locationId } = req.params;

  if (!mongoose.isValidObjectId(locationId)) {
    throw new CustomError('Invalid location ID', 400);
  }

  const inventoryLevels = await InventoryLevelModel.find({ locationId })
    .populate({
      path: 'variantId',
      select: 'sku optionValues productId images',
      match: { isInventoryTrackingEnabled: true, depricated: false },
      populate: { path: 'productId', select: 'title imageUrls' },
    })
    .lean();

  // Filter out entries where variant did not match (tracking disabled)
  const filtered = inventoryLevels.filter((lvl: any) => !!lvl.variantId);

  res.status(200).json({
    success: true,
    data: filtered,
    count: filtered.length,
    message: 'Inventory levels retrieved successfully'
  });
});

// Update inventory level: allow updating onHand, available, unavailable. Reject committed edits.
export const updateInventoryLevel: RequestHandler = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { onHand, available, unavailable } = req.body as Partial<{
    onHand: number;
    available: number;
    unavailable: { damaged: number; qualityControl: number; safetyStock: number; other: number };
  }>;

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid inventory level ID', 400);
  }

  const update: any = {};
  // Require at least one updatable field
  if (onHand === undefined && available === undefined && (unavailable === undefined || typeof unavailable !== 'object')) {
    throw new CustomError('No fields provided to update. Provide onHand, available, or unavailable.', 400);
  }
  if (typeof onHand === 'number') update.onHand = onHand;
  if (typeof available === 'number') update.available = available;
  if (unavailable && typeof unavailable === 'object') update.unavailable = unavailable;

  const updated = await InventoryLevelModel.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  })
    .populate({
      path: 'variantId',
      select: 'sku optionValues productId images',
      populate: { path: 'productId', select: 'title imageUrls' },
    });

  if (!updated) {
    throw new CustomError('Inventory level not found', 404);
  }

  res.status(200).json({ success: true, data: updated, message: 'Inventory level updated successfully' });
});
