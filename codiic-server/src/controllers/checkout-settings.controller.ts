import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import {
  CheckoutSettings,
  DEFAULT_CHECKOUT_CUSTOMER_INFORMATION,
  RECOMMENDED_ADD_TO_CART_LIMIT,
  normalizeCheckoutEmailRegionMode,
  type ICheckoutCustomerInformation,
} from '../models/checkout-settings/checkout-settings.model';
import { CheckoutSettingsEmailRegion } from '../models/checkout-settings/checkout-settings-email-region.model';

const mergeCustomerInformation = (
  current: ICheckoutCustomerInformation,
  incoming?: Partial<ICheckoutCustomerInformation>
): ICheckoutCustomerInformation => ({
  fullNameOption: incoming?.fullNameOption ?? current.fullNameOption,
  companyNameOption: incoming?.companyNameOption ?? current.companyNameOption,
  addressLine2Option: incoming?.addressLine2Option ?? current.addressLine2Option,
  shippingPhoneOption: incoming?.shippingPhoneOption ?? current.shippingPhoneOption,
});

const normalizeLegacyCheckoutSettings = (settings: {
  marketing?: {
    email?: {
      regionMode?: string | null;
    };
  };
  markModified?: (path: string) => void;
}) => {
  const currentMode = settings.marketing?.email?.regionMode;
  const normalizedMode = normalizeCheckoutEmailRegionMode(currentMode);
  if (currentMode !== normalizedMode && settings.marketing?.email) {
    settings.marketing.email.regionMode = normalizedMode;
    settings.markModified?.('marketing');
  }
};

const formatCheckoutSettingsResponse = async (settingsId: mongoose.Types.ObjectId) => {
  const settings = await CheckoutSettings.findById(settingsId).lean();
  if (!settings) {
    throw new CustomError('Checkout settings not found', 404);
  }

  const regions = await CheckoutSettingsEmailRegion.find({ checkoutSettingsId: settingsId })
    .select('countryId')
    .lean();

  return {
    ...settings,
    marketing: {
      ...settings.marketing,
      email: {
        ...settings.marketing?.email,
        regionMode: normalizeCheckoutEmailRegionMode(settings.marketing?.email?.regionMode),
      },
    },
    customerInformation: {
      ...DEFAULT_CHECKOUT_CUSTOMER_INFORMATION,
      ...(settings.customerInformation ?? {}),
    },
    emailSelectedRegionIds: regions.map((region) => String(region.countryId)),
  };
};

export const updateCheckoutSettings = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body ?? {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError('Invalid checkout settings id', 400);
  }

  const settings = await CheckoutSettings.findById(id);
  if (!settings) {
    throw new CustomError('Checkout settings not found', 404);
  }

  normalizeLegacyCheckoutSettings(settings);

  if (body.contactMethod !== undefined) {
    settings.contactMethod = body.contactMethod;
  }

  if (body.orderTracking !== undefined) {
    settings.orderTracking = {
      ...settings.orderTracking,
      ...body.orderTracking,
    };
  }

  if (typeof body.requireSignIn === 'boolean') {
    settings.requireSignIn = body.requireSignIn;
  }

  if (body.marketing !== undefined) {
    settings.marketing = {
      email: {
        enabled: body.marketing?.email?.enabled ?? settings.marketing.email.enabled,
        regionMode: normalizeCheckoutEmailRegionMode(
          body.marketing?.email?.regionMode ?? settings.marketing.email.regionMode
        ),
      },
      sms: {
        enabled: body.marketing?.sms?.enabled ?? settings.marketing.sms.enabled,
      },
    };
  }

  normalizeLegacyCheckoutSettings(settings);

  if (body.tipping !== undefined) {
    settings.tipping = {
      enabled: body.tipping?.enabled ?? settings.tipping.enabled,
      presets: body.tipping?.presets ?? settings.tipping.presets,
      hideUntilSelected: body.tipping?.hideUntilSelected ?? settings.tipping.hideUntilSelected,
    };
  }

  if (body.checkoutLanguage !== undefined) {
    settings.checkoutLanguage = body.checkoutLanguage;
  }

  if (body.addressCollection !== undefined) {
    settings.addressCollection = {
      useShippingAsBilling:
        body.addressCollection?.useShippingAsBilling ?? settings.addressCollection.useShippingAsBilling,
    };
  }

  if (body.addToCartLimit !== undefined) {
    settings.addToCartLimit = {
      enabled: body.addToCartLimit?.enabled ?? settings.addToCartLimit.enabled,
      limit:
        typeof body.addToCartLimit?.limit === 'number'
          ? body.addToCartLimit.limit
          : settings.addToCartLimit.limit,
      useRecommended:
        body.addToCartLimit?.useRecommended ?? settings.addToCartLimit.useRecommended,
    };
    settings.markModified('addToCartLimit');
  }

  if (body.customerInformation !== undefined) {
    const mergedCustomerInformation = mergeCustomerInformation(
      {
        ...DEFAULT_CHECKOUT_CUSTOMER_INFORMATION,
        ...(settings.toObject().customerInformation ?? {}),
      },
      body.customerInformation
    );
    settings.set('customerInformation', mergedCustomerInformation);
    settings.markModified('customerInformation');
  }

  await settings.save();

  if (Object.prototype.hasOwnProperty.call(body, 'emailSelectedRegionIds')) {
    const regionIds: string[] = Array.isArray(body.emailSelectedRegionIds)
      ? body.emailSelectedRegionIds
      : [];

    const invalidRegionId = regionIds.find((countryId) => !mongoose.Types.ObjectId.isValid(countryId));
    if (invalidRegionId) {
      throw new CustomError('One or more selected regions are invalid', 400);
    }

    await CheckoutSettingsEmailRegion.deleteMany({ checkoutSettingsId: settings._id });
    if (regionIds.length) {
      const documents = regionIds.map((countryId) => ({
        checkoutSettingsId: settings._id,
        storeId: settings.storeId,
        countryId,
      }));
      await CheckoutSettingsEmailRegion.insertMany(documents);
    }
  }

  const response = await formatCheckoutSettingsResponse(settings._id as mongoose.Types.ObjectId);
  res.status(200).json({ success: true, data: response });
});

export const getCheckoutSettingsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError('Invalid store id', 400);
  }

  let settings = await CheckoutSettings.findOne({ storeId });

  if (!settings) {
    settings = await CheckoutSettings.create({ storeId });
  }

  const response = await formatCheckoutSettingsResponse(settings._id as mongoose.Types.ObjectId);

  res.status(200).json({ success: true, data: response });
});

export const getStorefrontCheckoutCustomerInformation = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      throw new CustomError('Invalid store id', 400);
    }

    const existing = await CheckoutSettings.findOne({ storeId }).select('customerInformation').lean();
    if (!existing) {
      await CheckoutSettings.create({ storeId });
    }

    const settings = await CheckoutSettings.findOne({ storeId }).select('customerInformation').lean();
    const customerInformation = {
      ...DEFAULT_CHECKOUT_CUSTOMER_INFORMATION,
      ...(settings?.customerInformation ?? {}),
    };

    res.status(200).json({
      success: true,
      data: customerInformation,
    });
  }
);

export const getStorefrontAddToCartLimit = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      throw new CustomError('Invalid store id', 400);
    }

    const settings = await CheckoutSettings.findOne({ storeId }).select('addToCartLimit').lean();
    const enabled = settings?.addToCartLimit?.enabled ?? false;
    const useRecommended = settings?.addToCartLimit?.useRecommended ?? true;
    const configuredLimit = settings?.addToCartLimit?.limit;
    const limit =
      enabled
        ? useRecommended
          ? RECOMMENDED_ADD_TO_CART_LIMIT
          : typeof configuredLimit === 'number'
            ? configuredLimit
            : RECOMMENDED_ADD_TO_CART_LIMIT
        : null;

    res.status(200).json({
      success: true,
      data: {
        enabled,
        limit,
        useRecommended,
      },
    });
  }
);
