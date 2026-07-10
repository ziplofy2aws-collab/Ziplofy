import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { config } from '../config';
import { Store } from '../models/store/store.model';
import { StoreCustomTheme } from '../models/store-custom-theme/store-custom-theme.model';
import { Subdomain } from '../models/subdomain.model';
import { asyncErrorHandler } from '../utils/error.utils';

export const getSubdomainByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId) {
    return res.status(400).json({ success: false, message: 'storeId is required' });
  }

  const doc = await Subdomain.findOne({ storeId: new mongoose.Types.ObjectId(storeId) });
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Subdomain not found for store' });
  }

  // Build preview URL from subdomain (not stored in DB)
  const isProduction = process.env.NODE_ENV === 'production';
  const protocol = isProduction ? 'https' : 'http';
  const url = `${protocol}://${doc.subdomain}${config.storeRenderMicroserviceUrlSuffix}`;

  return res.status(200).json({ success: true, data: { ...doc.toObject(), url } });
});

// Public: check if a subdomain is valid and return store basic info
export const checkSubdomain = asyncErrorHandler(async (req: Request, res: Response) => {
  const subdomain = (req.query.subdomain as string || '').trim().toLowerCase();
  if (!subdomain) {
    return res.status(400).json({ success: false, message: 'subdomain is required' });
  }

  const mapping = await Subdomain.findOne({ subdomain });
  if (!mapping) {
    return res.status(404).json({ success: false, message: 'Subdomain not found' });
  }

  const store = await Store.findById(mapping.storeId)
    .select('storeName storeDescription appliedCustomThemeId')
    .lean();
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found for subdomain' });
  }

  const appliedCustomThemeId = store.appliedCustomThemeId
    ? String(store.appliedCustomThemeId)
    : null;

  let appliedCustomThemeName: string | null = null;
  if (appliedCustomThemeId) {
    const customTheme = await StoreCustomTheme.findById(appliedCustomThemeId)
      .select('themeName')
      .lean();
    appliedCustomThemeName = customTheme?.themeName ?? null;
  }

  return res.status(200).json({
    success: true,
    data: {
      storeId: store._id,
      name: store.storeName,
      description: store.storeDescription,
      appliedCustomThemeId,
      appliedCustomThemeName,
    }
  });
});


