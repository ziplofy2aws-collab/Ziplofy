import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { CheckoutSettings } from '../models/checkout-settings/checkout-settings.model';
import { CheckoutSettingsEmailRegion } from '../models/checkout-settings/checkout-settings-email-region.model';

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
    emailSelectedRegionIds: regions.map((region) => region.countryId),
  };
};

export const updateCheckoutSettings = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    contactMethod,
    orderTracking,
    requireSignIn,
    marketing,
    tipping,
    checkoutLanguage,
    addressCollection,
    addToCartLimit,
    emailSelectedRegionIds = [],
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError('Invalid checkout settings id', 400);
  }

  const settings = await CheckoutSettings.findById(id);
  if (!settings) {
    throw new CustomError('Checkout settings not found', 404);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    settings.contactMethod = contactMethod ?? settings.contactMethod;
    settings.orderTracking = {
      ...settings.orderTracking,
      ...orderTracking,
    };
    settings.requireSignIn = typeof requireSignIn === 'boolean' ? requireSignIn : settings.requireSignIn;
    settings.marketing = {
      email: {
        enabled: marketing?.email?.enabled ?? settings.marketing.email.enabled,
        regionMode: marketing?.email?.regionMode ?? settings.marketing.email.regionMode,
      },
      sms: {
        enabled: marketing?.sms?.enabled ?? settings.marketing.sms.enabled,
      },
    };
    settings.tipping = {
      enabled: tipping?.enabled ?? settings.tipping.enabled,
      presets: tipping?.presets ?? settings.tipping.presets,
      hideUntilSelected: tipping?.hideUntilSelected ?? settings.tipping.hideUntilSelected,
    };
    settings.checkoutLanguage = checkoutLanguage ?? settings.checkoutLanguage;
    settings.addressCollection = {
      useShippingAsBilling:
        addressCollection?.useShippingAsBilling ?? settings.addressCollection.useShippingAsBilling,
    };
    settings.addToCartLimit = {
      enabled: addToCartLimit?.enabled ?? settings.addToCartLimit.enabled,
      limit:
        typeof addToCartLimit?.limit === 'number' ? addToCartLimit.limit : settings.addToCartLimit.limit,
      useRecommended:
        addToCartLimit?.useRecommended ?? settings.addToCartLimit.useRecommended,
    };

    await settings.save({ session });

    const regionIds: string[] = Array.isArray(emailSelectedRegionIds)
      ? emailSelectedRegionIds
      : [];

    await CheckoutSettingsEmailRegion.deleteMany({ checkoutSettingsId: settings._id }).session(session);
    if (regionIds.length) {
      const documents = regionIds.map((countryId) => ({
        checkoutSettingsId: settings._id,
        storeId: settings.storeId,
        countryId,
      }));
      await CheckoutSettingsEmailRegion.insertMany(documents, { session });
    }

    await session.commitTransaction();
    session.endSession();

    const response = await formatCheckoutSettingsResponse(settings._id as mongoose.Types.ObjectId);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
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
