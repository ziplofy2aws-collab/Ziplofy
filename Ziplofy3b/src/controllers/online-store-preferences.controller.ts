import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  ONLINE_STORE_PREFERENCES_LIMITS,
  OnlineStorePreferences,
} from '../models/online-store-preferences/online-store-preferences.model';
import { Store } from '../models/store/store.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

type OnlineStorePreferencesPayload = {
  passwordProtectionEnabled?: boolean;
  storefrontPassword?: string;
  messageToYourVisitors?: string;
  b2bCustomersOnly?: boolean;
  seoHomePageTitle?: string;
  seoMetaDescription?: string;
  seoSocialImageUrl?: string;
  countryRedirectionEnabled?: boolean;
  languageRedirectionEnabled?: boolean;
  spamContactFormsEnabled?: boolean;
  spamAuthPagesEnabled?: boolean;
};

function trimOptionalString(value: unknown, maxLength?: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new CustomError(`Value cannot exceed ${maxLength} characters`, 400);
  }
  return trimmed;
}

function extractPayload(body: Record<string, unknown>): OnlineStorePreferencesPayload {
  const payload: OnlineStorePreferencesPayload = {};

  if (typeof body.passwordProtectionEnabled === 'boolean') {
    payload.passwordProtectionEnabled = body.passwordProtectionEnabled;
  }
  if (typeof body.b2bCustomersOnly === 'boolean') {
    payload.b2bCustomersOnly = body.b2bCustomersOnly;
  }
  if (typeof body.countryRedirectionEnabled === 'boolean') {
    payload.countryRedirectionEnabled = body.countryRedirectionEnabled;
  }
  if (typeof body.languageRedirectionEnabled === 'boolean') {
    payload.languageRedirectionEnabled = body.languageRedirectionEnabled;
  }
  if (typeof body.spamContactFormsEnabled === 'boolean') {
    payload.spamContactFormsEnabled = body.spamContactFormsEnabled;
  }
  if (typeof body.spamAuthPagesEnabled === 'boolean') {
    payload.spamAuthPagesEnabled = body.spamAuthPagesEnabled;
  }

  if (body.storefrontPassword !== undefined) {
    payload.storefrontPassword = trimOptionalString(
      body.storefrontPassword,
      ONLINE_STORE_PREFERENCES_LIMITS.storefrontPassword
    );
  }

  if (body.messageToYourVisitors !== undefined) {
    const message = typeof body.messageToYourVisitors === 'string' ? body.messageToYourVisitors.trim() : '';
    if (message.length > ONLINE_STORE_PREFERENCES_LIMITS.messageToYourVisitors) {
      throw new CustomError(
        `Message to visitors cannot exceed ${ONLINE_STORE_PREFERENCES_LIMITS.messageToYourVisitors} characters`,
        400
      );
    }
    payload.messageToYourVisitors = message;
  }

  if (body.seoHomePageTitle !== undefined) {
    const title = typeof body.seoHomePageTitle === 'string' ? body.seoHomePageTitle.trim() : '';
    if (title.length > ONLINE_STORE_PREFERENCES_LIMITS.seoHomePageTitle) {
      throw new CustomError(
        `SEO home page title cannot exceed ${ONLINE_STORE_PREFERENCES_LIMITS.seoHomePageTitle} characters`,
        400
      );
    }
    payload.seoHomePageTitle = title;
  }

  if (body.seoMetaDescription !== undefined) {
    const description =
      typeof body.seoMetaDescription === 'string' ? body.seoMetaDescription.trim() : '';
    if (description.length > ONLINE_STORE_PREFERENCES_LIMITS.seoMetaDescription) {
      throw new CustomError(
        `SEO meta description cannot exceed ${ONLINE_STORE_PREFERENCES_LIMITS.seoMetaDescription} characters`,
        400
      );
    }
    payload.seoMetaDescription = description;
  }

  if (body.seoSocialImageUrl !== undefined) {
    payload.seoSocialImageUrl =
      typeof body.seoSocialImageUrl === 'string' ? body.seoSocialImageUrl.trim() : '';
  }

  return payload;
}

function formatPreferencesResponse(preferences: {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  passwordProtectionEnabled: boolean;
  storefrontPassword?: string;
  messageToYourVisitors?: string;
  b2bCustomersOnly: boolean;
  seoHomePageTitle?: string;
  seoMetaDescription?: string;
  seoSocialImageUrl?: string;
  countryRedirectionEnabled: boolean;
  languageRedirectionEnabled: boolean;
  spamContactFormsEnabled: boolean;
  spamAuthPagesEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  const { storefrontPassword, ...rest } = preferences;
  return {
    ...rest,
    hasStorefrontPassword: Boolean(storefrontPassword?.trim()),
  };
}

async function getOrCreatePreferences(storeId: string) {
  let preferences = await OnlineStorePreferences.findOne({ storeId });

  if (!preferences) {
    const store = await Store.findById(storeId)
      .select('seoHomePageTitle seoMetaDescription seoSocialImageUrl')
      .lean();

    preferences = await OnlineStorePreferences.create({
      storeId,
      seoHomePageTitle: store?.seoHomePageTitle ?? '',
      seoMetaDescription: store?.seoMetaDescription ?? '',
      seoSocialImageUrl: store?.seoSocialImageUrl ?? '',
    });
  }

  return preferences;
}

async function syncStoreSeoFields(
  storeId: mongoose.Types.ObjectId,
  payload: OnlineStorePreferencesPayload
) {
  const seoUpdate: Partial<{
    seoHomePageTitle: string;
    seoMetaDescription: string;
    seoSocialImageUrl: string;
  }> = {};

  if (payload.seoHomePageTitle !== undefined) {
    seoUpdate.seoHomePageTitle = payload.seoHomePageTitle;
  }
  if (payload.seoMetaDescription !== undefined) {
    seoUpdate.seoMetaDescription = payload.seoMetaDescription;
  }
  if (payload.seoSocialImageUrl !== undefined) {
    seoUpdate.seoSocialImageUrl = payload.seoSocialImageUrl;
  }

  if (Object.keys(seoUpdate).length === 0) return;

  await Store.findByIdAndUpdate(storeId, { $set: seoUpdate });
}

export const getOnlineStorePreferencesByStoreId = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params as { storeId?: string };

    if (!storeId || !mongoose.isValidObjectId(storeId)) {
      throw new CustomError('Valid storeId is required', 400);
    }

    const preferences = await getOrCreatePreferences(storeId);

    return res.status(200).json({
      success: true,
      data: formatPreferencesResponse(preferences.toObject()),
      message: 'Online store preferences fetched',
    });
  }
);

export const updateOnlineStorePreferences = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };
  const payload = extractPayload(req.body as Record<string, unknown>);

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid online store preferences id is required', 400);
  }

  const existing = await OnlineStorePreferences.findById(id);
  if (!existing) {
    throw new CustomError('Online store preferences not found', 404);
  }

  const $set: Record<string, unknown> = { ...payload };
  const $unset: Record<string, ''> = {};

  delete $set.storefrontPassword;

  if (payload.passwordProtectionEnabled === false) {
    $unset.storefrontPassword = '';
  } else if (payload.storefrontPassword) {
    $set.storefrontPassword = payload.storefrontPassword;
  }

  const updateQuery: { $set?: Record<string, unknown>; $unset?: Record<string, ''> } = { $set };
  if (Object.keys($unset).length > 0) {
    updateQuery.$unset = $unset;
  }

  const updated = await OnlineStorePreferences.findByIdAndUpdate(
    id,
    updateQuery,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new CustomError('Online store preferences not found', 404);
  }

  await syncStoreSeoFields(updated.storeId, payload);

  return res.status(200).json({
    success: true,
    data: formatPreferencesResponse(updated.toObject()),
    message: 'Online store preferences updated',
  });
});
