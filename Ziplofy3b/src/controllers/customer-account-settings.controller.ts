import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CustomerAccountSettings, ICustomerAccountSettings } from '../models/customer-account-settings/customer-account-settings.model';
import { Store } from '../models/store/store.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// GET /api/customer-account-settings/store/:storeId
export const getCustomerAccountSettingsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId?: string };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  // Verify store exists
  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new CustomError('Store not found', 404);
  }

  // Find or create settings using the static method
  let settings = await CustomerAccountSettings.findOne({ storeId }).lean();

  // If settings don't exist, create them with default values
  if (!settings) {
    const newSettings = await CustomerAccountSettings.create({
      storeId: new mongoose.Types.ObjectId(storeId),
      showSignInLinks: false,
      accountVersion: 'recommended',
      selfServeReturns: false,
      storeCredit: false,
      shopAuth: {
        enabled: true,
      },
      googleAuth: {
        enabled: false,
      },
      facebookAuth: {
        enabled: false,
      },
    });
    settings = newSettings.toObject() as any;
    return res.status(200).json({
      success: true,
      data: settings,
      message: 'Customer account settings created and fetched successfully',
      meta: {
        store: {
          id: String(store._id),
          name: store.storeName,
        },
      },
    });
  }

  return res.status(200).json({
    success: true,
    data: settings,
    message: 'Customer account settings fetched successfully',
    meta: {
      store: {
        id: String(store._id),
        name: store.storeName,
      },
    },
  });
});

// PUT /api/customer-account-settings/:id
export const updateCustomerAccountSettings = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid settings id is required', 400);
  }

  // Check if settings exist and fetch with secrets included
  const existingSettings = await CustomerAccountSettings.findById(id)
    .select('+googleAuth.clientSecret +facebookAuth.appSecret');
  if (!existingSettings) {
    throw new CustomError('Customer account settings not found', 404);
  }

  // Extract and validate payload
  const {
    showSignInLinks,
    accountVersion,
    selfServeReturns,
    storeCredit,
    shopAuth,
    googleAuth,
    facebookAuth,
    customAccountUrl,
  } = req.body;

  const updatePayload: Partial<ICustomerAccountSettings> = {};

  // Update main fields
  if (showSignInLinks !== undefined) {
    if (typeof showSignInLinks !== 'boolean') {
      throw new CustomError('showSignInLinks must be a boolean', 400);
    }
    updatePayload.showSignInLinks = showSignInLinks;
  }

  if (accountVersion !== undefined) {
    if (!['recommended', 'legacy'].includes(accountVersion)) {
      throw new CustomError('accountVersion must be either "recommended" or "legacy"', 400);
    }
    updatePayload.accountVersion = accountVersion;
  }

  if (selfServeReturns !== undefined) {
    if (typeof selfServeReturns !== 'boolean') {
      throw new CustomError('selfServeReturns must be a boolean', 400);
    }
    updatePayload.selfServeReturns = selfServeReturns;
  }

  if (storeCredit !== undefined) {
    if (typeof storeCredit !== 'boolean') {
      throw new CustomError('storeCredit must be a boolean', 400);
    }
    updatePayload.storeCredit = storeCredit;
  }

  if (customAccountUrl !== undefined) {
    if (customAccountUrl !== null && customAccountUrl !== '') {
      // Validate URL format
      try {
        new URL(customAccountUrl);
        updatePayload.customAccountUrl = customAccountUrl;
      } catch {
        throw new CustomError('customAccountUrl must be a valid URL', 400);
      }
    } else {
      updatePayload.customAccountUrl = undefined;
    }
  }

  // Update Shop auth
  if (shopAuth !== undefined) {
    if (typeof shopAuth !== 'object' || shopAuth === null) {
      throw new CustomError('shopAuth must be an object', 400);
    }
    const shopAuthUpdate: any = {
      enabled: existingSettings.shopAuth.enabled,
      lastUpdatedAt: existingSettings.shopAuth.lastUpdatedAt,
    };
    if (shopAuth.enabled !== undefined) {
      if (typeof shopAuth.enabled !== 'boolean') {
        throw new CustomError('shopAuth.enabled must be a boolean', 400);
      }
      shopAuthUpdate.enabled = shopAuth.enabled;
    }
    updatePayload.shopAuth = shopAuthUpdate;
  }

  // Update Google auth
  if (googleAuth !== undefined) {
    if (typeof googleAuth !== 'object' || googleAuth === null) {
      throw new CustomError('googleAuth must be an object', 400);
    }
    const googleAuthUpdate: any = {
      enabled: existingSettings.googleAuth.enabled,
      clientId: existingSettings.googleAuth.clientId,
      clientSecret: existingSettings.googleAuth.clientSecret,
      authorizedJavaScriptOrigins: existingSettings.googleAuth.authorizedJavaScriptOrigins || [],
      authorizedRedirectURIs: existingSettings.googleAuth.authorizedRedirectURIs || [],
      deauthorizeCallbackURIs: existingSettings.googleAuth.deauthorizeCallbackURIs || [],
      connectedAt: existingSettings.googleAuth.connectedAt,
      lastUpdatedAt: existingSettings.googleAuth.lastUpdatedAt,
    };

    if (googleAuth.enabled !== undefined) {
      if (typeof googleAuth.enabled !== 'boolean') {
        throw new CustomError('googleAuth.enabled must be a boolean', 400);
      }
      googleAuthUpdate.enabled = googleAuth.enabled;
    }

    if (googleAuth.clientId !== undefined) {
      if (typeof googleAuth.clientId !== 'string') {
        throw new CustomError('googleAuth.clientId must be a string', 400);
      }
      googleAuthUpdate.clientId = googleAuth.clientId.trim();
    }

    if (googleAuth.clientSecret !== undefined) {
      if (typeof googleAuth.clientSecret !== 'string') {
        throw new CustomError('googleAuth.clientSecret must be a string', 400);
      }
      googleAuthUpdate.clientSecret = googleAuth.clientSecret.trim();
    }

    if (googleAuth.authorizedJavaScriptOrigins !== undefined) {
      if (!Array.isArray(googleAuth.authorizedJavaScriptOrigins)) {
        throw new CustomError('googleAuth.authorizedJavaScriptOrigins must be an array', 400);
      }
      googleAuthUpdate.authorizedJavaScriptOrigins = googleAuth.authorizedJavaScriptOrigins.map((url: string) => url.trim());
    }

    if (googleAuth.authorizedRedirectURIs !== undefined) {
      if (!Array.isArray(googleAuth.authorizedRedirectURIs)) {
        throw new CustomError('googleAuth.authorizedRedirectURIs must be an array', 400);
      }
      googleAuthUpdate.authorizedRedirectURIs = googleAuth.authorizedRedirectURIs.map((url: string) => url.trim());
    }

    if (googleAuth.deauthorizeCallbackURIs !== undefined) {
      if (!Array.isArray(googleAuth.deauthorizeCallbackURIs)) {
        throw new CustomError('googleAuth.deauthorizeCallbackURIs must be an array', 400);
      }
      googleAuthUpdate.deauthorizeCallbackURIs = googleAuth.deauthorizeCallbackURIs.map((url: string) => url.trim());
    }

    updatePayload.googleAuth = googleAuthUpdate;
  }

  // Update Facebook auth
  if (facebookAuth !== undefined) {
    if (typeof facebookAuth !== 'object' || facebookAuth === null) {
      throw new CustomError('facebookAuth must be an object', 400);
    }
    const facebookAuthUpdate: any = {
      enabled: existingSettings.facebookAuth.enabled,
      appId: existingSettings.facebookAuth.appId,
      appSecret: existingSettings.facebookAuth.appSecret,
      domains: existingSettings.facebookAuth.domains || [],
      redirectURLs: existingSettings.facebookAuth.redirectURLs || [],
      deauthorizeCallbackURLs: existingSettings.facebookAuth.deauthorizeCallbackURLs || [],
      connectedAt: existingSettings.facebookAuth.connectedAt,
      lastUpdatedAt: existingSettings.facebookAuth.lastUpdatedAt,
    };

    if (facebookAuth.enabled !== undefined) {
      if (typeof facebookAuth.enabled !== 'boolean') {
        throw new CustomError('facebookAuth.enabled must be a boolean', 400);
      }
      facebookAuthUpdate.enabled = facebookAuth.enabled;
    }

    if (facebookAuth.appId !== undefined) {
      if (typeof facebookAuth.appId !== 'string') {
        throw new CustomError('facebookAuth.appId must be a string', 400);
      }
      facebookAuthUpdate.appId = facebookAuth.appId.trim();
    }

    if (facebookAuth.appSecret !== undefined) {
      if (typeof facebookAuth.appSecret !== 'string') {
        throw new CustomError('facebookAuth.appSecret must be a string', 400);
      }
      facebookAuthUpdate.appSecret = facebookAuth.appSecret.trim();
    }

    if (facebookAuth.domains !== undefined) {
      if (!Array.isArray(facebookAuth.domains)) {
        throw new CustomError('facebookAuth.domains must be an array', 400);
      }
      facebookAuthUpdate.domains = facebookAuth.domains.map((url: string) => url.trim());
    }

    if (facebookAuth.redirectURLs !== undefined) {
      if (!Array.isArray(facebookAuth.redirectURLs)) {
        throw new CustomError('facebookAuth.redirectURLs must be an array', 400);
      }
      facebookAuthUpdate.redirectURLs = facebookAuth.redirectURLs.map((url: string) => url.trim());
    }

    if (facebookAuth.deauthorizeCallbackURLs !== undefined) {
      if (!Array.isArray(facebookAuth.deauthorizeCallbackURLs)) {
        throw new CustomError('facebookAuth.deauthorizeCallbackURLs must be an array', 400);
      }
      facebookAuthUpdate.deauthorizeCallbackURLs = facebookAuth.deauthorizeCallbackURLs.map((url: string) => url.trim());
    }

    updatePayload.facebookAuth = facebookAuthUpdate;
  }

  // Update the settings
  const updated = await CustomerAccountSettings.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new CustomError('Failed to update customer account settings', 500);
  }

  // Get store info for response
  const store = await Store.findById(updated.storeId).lean();
  if (!store) {
    throw new CustomError('Store not found', 404);
  }

  // Convert to plain object and exclude sensitive fields if needed
  const responseData = updated.toObject();

  return res.status(200).json({
    success: true,
    data: responseData,
    message: 'Customer account settings updated successfully',
    meta: {
      store: {
        id: String(store._id),
        name: store.storeName,
      },
    },
  });
});

