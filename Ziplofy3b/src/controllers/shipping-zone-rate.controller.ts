import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ShippingZoneRate } from '../models/shipping-zone/shipping-zone-rate.model';
import { ShippingZone } from '../models/shipping-zone/shipping-zone.model';
import { Store } from '../models/store/store.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

interface CreateShippingZoneRateBody {
  shippingZoneId?: string;
  rateType?: 'flat' | 'carrier';
  shippingRate?: string;
  customRateName?: string;
  customDeliveryDescription?: string;
  price?: number | string;
  conditionalPricingEnabled?: boolean;
  conditionalPricingBasis?: 'weight' | 'price';
  minWeight?: number | string;
  maxWeight?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
}

interface UpdateShippingZoneRateBody {
  rateType?: 'flat' | 'carrier';
  shippingRate?: string;
  customRateName?: string;
  customDeliveryDescription?: string;
  price?: number | string;
  conditionalPricingEnabled?: boolean;
  conditionalPricingBasis?: 'weight' | 'price';
  minWeight?: number | string;
  maxWeight?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
}

// POST /shipping-zone-rates
export const createShippingZoneRate = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    shippingZoneId,
    rateType,
    shippingRate,
    customRateName,
    customDeliveryDescription,
    price,
    conditionalPricingEnabled,
    conditionalPricingBasis,
    minWeight,
    maxWeight,
    minPrice,
    maxPrice,
  } = req.body as CreateShippingZoneRateBody;

  // Validate required fields
  if (!shippingZoneId || !mongoose.isValidObjectId(shippingZoneId)) {
    throw new CustomError('Valid shippingZoneId is required', 400);
  }

  if (!customRateName || typeof customRateName !== 'string' || !customRateName.trim()) {
    throw new CustomError('customRateName is required', 400);
  }

  // Verify shipping zone exists and get storeId from shipping profile
  const shippingZone = await ShippingZone.findById(shippingZoneId)
    .populate({
      path: 'shippingProfileId',
      select: 'storeId',
      populate: {
        path: 'storeId',
        select: 'storeName',
      },
    })
    .lean();
  if (!shippingZone) {
    throw new CustomError('Shipping zone not found', 404);
  }

  // Get storeId from shipping profile
  const shippingProfile = shippingZone.shippingProfileId as any;
  const actualStoreId = shippingProfile?.storeId?._id || shippingProfile?.storeId || shippingZone.shippingProfileId;
  
  // Verify store exists
  const store = await Store.findById(actualStoreId).lean();
  if (!store) {
    throw new CustomError('Store not found', 404);
  }

  // Use the storeId from shipping profile, not from request body
  const finalStoreId = String(actualStoreId);

  // Validate rate type
  const validRateType = rateType === 'carrier' ? 'carrier' : 'flat';

  // Parse and validate price
  const priceValue = typeof price === 'string' ? parseFloat(price) : price || 0;
  if (isNaN(priceValue) || priceValue < 0) {
    throw new CustomError('Valid price is required (must be >= 0)', 400);
  }

  // Prepare rate data
  const rateData: any = {
    shippingZoneId,
    storeId: finalStoreId,
    rateType: validRateType,
    shippingRate: shippingRate || 'custom',
    customRateName: customRateName.trim(),
    price: priceValue,
    conditionalPricingEnabled: conditionalPricingEnabled || false,
  };

  // Add optional fields
  if (customDeliveryDescription && customDeliveryDescription.trim()) {
    rateData.customDeliveryDescription = customDeliveryDescription.trim();
  }

  // Handle conditional pricing
  if (rateData.conditionalPricingEnabled) {
    if (conditionalPricingBasis === 'weight' || conditionalPricingBasis === 'price') {
      rateData.conditionalPricingBasis = conditionalPricingBasis;

      if (conditionalPricingBasis === 'weight') {
        if (minWeight !== undefined && minWeight !== null && minWeight !== '') {
          const minWeightValue = typeof minWeight === 'string' ? parseFloat(minWeight) : minWeight;
          if (!isNaN(minWeightValue) && minWeightValue >= 0) {
            rateData.minWeight = minWeightValue;
          }
        }
        if (maxWeight !== undefined && maxWeight !== null && maxWeight !== '') {
          const maxWeightValue = typeof maxWeight === 'string' ? parseFloat(maxWeight) : maxWeight;
          if (!isNaN(maxWeightValue) && maxWeightValue >= 0) {
            rateData.maxWeight = maxWeightValue;
          }
        }
      } else if (conditionalPricingBasis === 'price') {
        if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
          const minPriceValue = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
          if (!isNaN(minPriceValue) && minPriceValue >= 0) {
            rateData.minPrice = minPriceValue;
          }
        }
        if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
          const maxPriceValue = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
          if (!isNaN(maxPriceValue) && maxPriceValue >= 0) {
            rateData.maxPrice = maxPriceValue;
          }
        }
      }
    }
  }

  // Create the rate
  const createdRate = await ShippingZoneRate.create(rateData);

  // Populate references
  const populatedRate = await ShippingZoneRate.findById(createdRate._id)
    .populate('shippingZoneId', 'zoneName')
    .populate('storeId', 'storeName')
    .lean();

  return res.status(201).json({
    success: true,
    data: populatedRate,
    message: 'Shipping zone rate created successfully',
    meta: {
      shippingZone: shippingZone ? {
        id: String(shippingZone._id),
        name: shippingZone.zoneName,
      } : undefined,
      store: store ? {
        id: String(store._id),
        name: store.storeName,
      } : undefined,
    },
  });
});

// GET /shipping-zone-rates/zone/:shippingZoneId
export const getShippingZoneRatesByZoneId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { shippingZoneId } = req.params;

  if (!shippingZoneId || !mongoose.isValidObjectId(shippingZoneId)) {
    throw new CustomError('Valid shippingZoneId is required', 400);
  }

  // Verify shipping zone exists
  const shippingZone = await ShippingZone.findById(shippingZoneId)
    .populate('shippingProfileId', 'profileName')
    .lean();

  if (!shippingZone) {
    throw new CustomError('Shipping zone not found', 404);
  }

  // Fetch all rates for this zone
  const rates = await ShippingZoneRate.find({ shippingZoneId })
    .populate('storeId', 'storeName')
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    data: rates,
    message: 'Shipping zone rates fetched successfully',
    meta: {
      total: rates.length,
      shippingZone: {
        id: String(shippingZone._id),
        name: shippingZone.zoneName,
      },
      shippingProfile: shippingZone.shippingProfileId ? {
        id: String((shippingZone.shippingProfileId as any)._id),
        name: (shippingZone.shippingProfileId as any).profileName,
      } : undefined,
    },
  });
});

// PUT /shipping-zone-rates/:id
export const updateShippingZoneRate = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    rateType,
    shippingRate,
    customRateName,
    customDeliveryDescription,
    price,
    conditionalPricingEnabled,
    conditionalPricingBasis,
    minWeight,
    maxWeight,
    minPrice,
    maxPrice,
  } = req.body as UpdateShippingZoneRateBody;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid rate ID is required', 400);
  }

  // Find the rate
  const existingRate = await ShippingZoneRate.findById(id).lean();
  if (!existingRate) {
    throw new CustomError('Shipping zone rate not found', 404);
  }

  // Prepare update data
  const updateData: any = {};

  if (rateType !== undefined) {
    updateData.rateType = rateType === 'carrier' ? 'carrier' : 'flat';
  }

  if (shippingRate !== undefined) {
    updateData.shippingRate = shippingRate;
  }

  if (customRateName !== undefined) {
    if (typeof customRateName !== 'string' || !customRateName.trim()) {
      throw new CustomError('customRateName must be a non-empty string', 400);
    }
    updateData.customRateName = customRateName.trim();
  }

  if (customDeliveryDescription !== undefined) {
    if (customDeliveryDescription === null || customDeliveryDescription === '') {
      updateData.customDeliveryDescription = undefined;
    } else if (typeof customDeliveryDescription === 'string') {
      updateData.customDeliveryDescription = customDeliveryDescription.trim();
    }
  }

  if (price !== undefined) {
    const priceValue = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(priceValue) || priceValue < 0) {
      throw new CustomError('Valid price is required (must be >= 0)', 400);
    }
    updateData.price = priceValue;
  }

  if (conditionalPricingEnabled !== undefined) {
    updateData.conditionalPricingEnabled = conditionalPricingEnabled;
  }

  // Handle conditional pricing fields
  if (conditionalPricingEnabled !== undefined || conditionalPricingBasis !== undefined) {
    if (conditionalPricingBasis === 'weight' || conditionalPricingBasis === 'price') {
      updateData.conditionalPricingBasis = conditionalPricingBasis;

      if (conditionalPricingBasis === 'weight') {
        if (minWeight !== undefined) {
          if (minWeight === null || minWeight === '') {
            updateData.minWeight = undefined;
          } else {
            const minWeightValue = typeof minWeight === 'string' ? parseFloat(minWeight) : minWeight;
            if (!isNaN(minWeightValue) && minWeightValue >= 0) {
              updateData.minWeight = minWeightValue;
            }
          }
        }
        if (maxWeight !== undefined) {
          if (maxWeight === null || maxWeight === '') {
            updateData.maxWeight = undefined;
          } else {
            const maxWeightValue = typeof maxWeight === 'string' ? parseFloat(maxWeight) : maxWeight;
            if (!isNaN(maxWeightValue) && maxWeightValue >= 0) {
              updateData.maxWeight = maxWeightValue;
            }
          }
        }
        // Clear price-based fields
        updateData.minPrice = undefined;
        updateData.maxPrice = undefined;
      } else if (conditionalPricingBasis === 'price') {
        if (minPrice !== undefined) {
          if (minPrice === null || minPrice === '') {
            updateData.minPrice = undefined;
          } else {
            const minPriceValue = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
            if (!isNaN(minPriceValue) && minPriceValue >= 0) {
              updateData.minPrice = minPriceValue;
            }
          }
        }
        if (maxPrice !== undefined) {
          if (maxPrice === null || maxPrice === '') {
            updateData.maxPrice = undefined;
          } else {
            const maxPriceValue = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
            if (!isNaN(maxPriceValue) && maxPriceValue >= 0) {
              updateData.maxPrice = maxPriceValue;
            }
          }
        }
        // Clear weight-based fields
        updateData.minWeight = undefined;
        updateData.maxWeight = undefined;
      }
    } else if (conditionalPricingEnabled === false) {
      // Clear all conditional pricing fields when disabled
      updateData.conditionalPricingBasis = undefined;
      updateData.minWeight = undefined;
      updateData.maxWeight = undefined;
      updateData.minPrice = undefined;
      updateData.maxPrice = undefined;
    }
  } else {
    // Handle individual field updates when basis is not changing
    if (minWeight !== undefined) {
      if (minWeight === null || minWeight === '') {
        updateData.minWeight = undefined;
      } else {
        const minWeightValue = typeof minWeight === 'string' ? parseFloat(minWeight) : minWeight;
        if (!isNaN(minWeightValue) && minWeightValue >= 0) {
          updateData.minWeight = minWeightValue;
        }
      }
    }
    if (maxWeight !== undefined) {
      if (maxWeight === null || maxWeight === '') {
        updateData.maxWeight = undefined;
      } else {
        const maxWeightValue = typeof maxWeight === 'string' ? parseFloat(maxWeight) : maxWeight;
        if (!isNaN(maxWeightValue) && maxWeightValue >= 0) {
          updateData.maxWeight = maxWeightValue;
        }
      }
    }
    if (minPrice !== undefined) {
      if (minPrice === null || minPrice === '') {
        updateData.minPrice = undefined;
      } else {
        const minPriceValue = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
        if (!isNaN(minPriceValue) && minPriceValue >= 0) {
          updateData.minPrice = minPriceValue;
        }
      }
    }
    if (maxPrice !== undefined) {
      if (maxPrice === null || maxPrice === '') {
        updateData.maxPrice = undefined;
      } else {
        const maxPriceValue = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
        if (!isNaN(maxPriceValue) && maxPriceValue >= 0) {
          updateData.maxPrice = maxPriceValue;
        }
      }
    }
  }

  // Update the rate
  const updatedRate = await ShippingZoneRate.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('shippingZoneId', 'zoneName')
    .populate('storeId', 'storeName')
    .lean();

  if (!updatedRate) {
    throw new CustomError('Failed to update shipping zone rate', 500);
  }

  // Get shipping zone info
  const shippingZone = await ShippingZone.findById(updatedRate.shippingZoneId)
    .populate('shippingProfileId', 'profileName')
    .lean();

  return res.status(200).json({
    success: true,
    data: updatedRate,
    message: 'Shipping zone rate updated successfully',
    meta: {
      shippingZone: shippingZone ? {
        id: String(shippingZone._id),
        name: shippingZone.zoneName,
      } : undefined,
      shippingProfile: shippingZone?.shippingProfileId ? {
        id: String((shippingZone.shippingProfileId as any)._id),
        name: (shippingZone.shippingProfileId as any).profileName,
      } : undefined,
    },
  });
});

// DELETE /shipping-zone-rates/:id
export const deleteShippingZoneRate = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid rate ID is required', 400);
  }

  // Find and delete the rate
  const deletedRate = await ShippingZoneRate.findByIdAndDelete(id)
    .populate('shippingZoneId', 'zoneName')
    .populate('storeId', 'storeName')
    .lean();

  if (!deletedRate) {
    throw new CustomError('Shipping zone rate not found', 404);
  }

  // Get shipping zone info for meta
  const zone = deletedRate.shippingZoneId
    ? await ShippingZone.findById(deletedRate.shippingZoneId)
        .populate('shippingProfileId', 'profileName')
        .lean()
    : null;

  return res.status(200).json({
    success: true,
    data: deletedRate,
    message: 'Shipping zone rate deleted successfully',
    meta: {
      shippingZone: deletedRate.shippingZoneId ? {
        id: String((deletedRate.shippingZoneId as any)._id),
        name: (deletedRate.shippingZoneId as any).zoneName,
      } : undefined,
      shippingProfile: zone?.shippingProfileId ? {
        id: String((zone.shippingProfileId as any)._id),
        name: (zone.shippingProfileId as any).profileName,
      } : undefined,
    },
  });
});

