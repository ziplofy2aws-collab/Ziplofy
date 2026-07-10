import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { OnlineStorePreferences } from '../models/online-store-preferences/online-store-preferences.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { isStorefrontUnlocked } from '../utils/storefront-access.util';

export const requireStorefrontAccessIfEnabled = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const storeId = req.params.storeId as string | undefined;

    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      return next();
    }

    const preferences = await OnlineStorePreferences.findOne({ storeId })
      .select('passwordProtectionEnabled storefrontPassword')
      .lean();

    const protectionActive =
      Boolean(preferences?.passwordProtectionEnabled) &&
      Boolean(preferences?.storefrontPassword?.trim());

    if (!protectionActive) {
      return next();
    }

    if (isStorefrontUnlocked(req, storeId)) {
      return next();
    }

    throw new CustomError('Storefront password required', 403);
  }
);
