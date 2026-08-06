import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { config } from '../config';
import { Store } from '../models/store/store.model';
import { resolveStorefrontThemeSource } from '../utils/storefront-theme-resolution.util';
import { Subdomain } from '../models/subdomain.model';
import { StoreDomain } from '../models/store-domain.model';
import { normalizeHostname } from '../services/domain/domain.service';
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

  const isProduction = process.env.NODE_ENV === 'production';
  const protocol = isProduction ? 'https' : 'http';
  const customDomain = doc.customDomain?.trim().toLowerCase();
  const url = customDomain
    ? `${protocol}://${customDomain}`
    : `${protocol}://${doc.subdomain}${config.storeRenderMicroserviceUrlSuffix}`;

  return res.status(200).json({ success: true, data: { ...doc.toObject(), url } });
});

async function buildStorefrontCheckPayload(storeId: mongoose.Types.ObjectId | string) {
  const store = await Store.findById(storeId)
    .select('storeName storeDescription seoHomePageTitle seoMetaDescription seoSocialImageUrl appliedCustomThemeId appliedTheme')
    .lean();
  if (!store) return null;

  const themeSource = await resolveStorefrontThemeSource(String(store._id));

  return {
    storeId: store._id,
    name: store.storeName,
    description: store.storeDescription,
    seoHomePageTitle: store.seoHomePageTitle ?? '',
    seoMetaDescription: store.seoMetaDescription ?? '',
    seoSocialImageUrl: store.seoSocialImageUrl ?? '',
    themeKind: themeSource.kind,
    appliedCustomThemeId: themeSource.storeCustomThemeId,
    appliedCustomThemeName: themeSource.storeCustomThemeName,
    appliedThemeId: themeSource.catalogThemeId,
    appliedThemeName: themeSource.catalogThemeName,
  };
}

// Public: check if a subdomain OR custom host is valid and return store basic info
export const checkSubdomain = asyncErrorHandler(async (req: Request, res: Response) => {
  const subdomain = (req.query.subdomain as string || '').trim().toLowerCase();
  const host = normalizeHostname((req.query.host as string || '').trim());

  if (!subdomain && !host) {
    return res.status(400).json({ success: false, message: 'subdomain or host is required' });
  }

  let mapping =
    subdomain
      ? await Subdomain.findOne({ subdomain })
      : null;

  if (!mapping && host) {
    mapping = await Subdomain.findOne({ customDomain: host });
  }

  if (!mapping && host) {
    const connected = await StoreDomain.findOne({ hostname: host, status: 'active' }).lean();
    if (connected) {
      mapping = await Subdomain.findOne({ storeId: connected.storeId });
    }
  }

  if (!mapping) {
    return res.status(404).json({ success: false, message: host ? 'Host not found' : 'Subdomain not found' });
  }

  const payload = await buildStorefrontCheckPayload(mapping.storeId);
  if (!payload) {
    return res.status(404).json({ success: false, message: 'Store not found for subdomain' });
  }

  return res.status(200).json({
    success: true,
    data: payload,
  });
});
