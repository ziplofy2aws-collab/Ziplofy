import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreCheckoutConfiguration } from '../models/store-checkout-configuration/store-checkout-configuration.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

/** Public storefront read — checkout UI settings only (no admin metadata). */
export const getStorefrontCheckoutConfigurationByStoreId = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId?: string };

    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      throw new CustomError('Valid storeId is required', 400);
    }

    const doc = await StoreCheckoutConfiguration.findOne({ storeId })
      .select('checkoutConfig storeId')
      .lean();

    res.status(200).json({
      success: true,
      message: doc
        ? 'Store checkout configuration retrieved'
        : 'No checkout configuration found for this store',
      data: doc
        ? {
            storeId: String(doc.storeId),
            checkoutConfig: doc.checkoutConfig ?? {},
          }
        : null,
    });
  }
);
