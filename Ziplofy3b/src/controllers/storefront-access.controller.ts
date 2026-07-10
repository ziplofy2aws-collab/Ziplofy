import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { OnlineStorePreferences } from '../models/online-store-preferences/online-store-preferences.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import {
  isStorefrontUnlocked,
  signStorefrontUnlockToken,
} from '../utils/storefront-access.util';

export const getStorefrontAccess = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId?: string };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const preferences = await OnlineStorePreferences.findOne({ storeId }).lean();

  const passwordProtectionEnabled = Boolean(preferences?.passwordProtectionEnabled);
  const hasStorefrontPassword = Boolean(preferences?.storefrontPassword?.trim());
  const protectionActive = passwordProtectionEnabled && hasStorefrontPassword;
  const unlocked = !protectionActive || isStorefrontUnlocked(req, storeId);

  return res.status(200).json({
    success: true,
    data: {
      passwordProtectionEnabled: protectionActive,
      messageToYourVisitors: preferences?.messageToYourVisitors?.trim() || '',
      unlocked,
    },
    message: 'Storefront access fetched',
  });
});

export const verifyStorefrontPassword = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId?: string };
  const { password } = req.body as { password?: string };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    throw new CustomError('Password is required', 400);
  }

  const preferences = await OnlineStorePreferences.findOne({ storeId })
    .select('passwordProtectionEnabled storefrontPassword messageToYourVisitors')
    .lean();

  if (!preferences?.passwordProtectionEnabled || !preferences.storefrontPassword?.trim()) {
    throw new CustomError('Password protection is not enabled for this store', 400);
  }

  if (password.trim() !== preferences.storefrontPassword.trim()) {
    throw new CustomError('Incorrect password', 401);
  }

  const unlockToken = signStorefrontUnlockToken(storeId);

  return res.status(200).json({
    success: true,
    data: {
      unlocked: true,
      unlockToken,
      messageToYourVisitors: preferences.messageToYourVisitors?.trim() || '',
    },
    message: 'Storefront unlocked',
  });
});
