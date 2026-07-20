import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GeneralSettings } from '../models/general-settings/general-settings.model';
import { Store } from '../models/store/store.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

type GeneralSettingsPayload = {
  backupRegion?: string;
  unitSystem?: 'metric' | 'imperial';
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  timeZone?: string;
  orderIdPrefix?: string;
  orderIdSuffix?: string;
  fulfillmentOption?: 'fulfill_all' | 'fulfill_gift_cards' | 'dont_fulfill';
  notifyCustomers?: boolean;
  fulfillHighRiskOrders?: boolean;
  autoArchive?: boolean;
  storeName?: string;
  storeEmail?: string;
  storePhone?: string;
  legalBusinessName?: string;
  billingCountry?: string;
  billingAddress?: string;
  billingApartment?: string;
  billingCity?: string;
  billingState?: string;
  billingPinCode?: string;
};

const extractPayload = (body: any): GeneralSettingsPayload => {
  const payload: GeneralSettingsPayload = {};

  const assignIfDefined = (key: keyof GeneralSettingsPayload) => {
    if (body[key] !== undefined) {
      payload[key] = body[key];
    }
  };

  assignIfDefined('backupRegion');
  assignIfDefined('unitSystem');
  assignIfDefined('weightUnit');
  assignIfDefined('timeZone');
  assignIfDefined('orderIdPrefix');
  assignIfDefined('orderIdSuffix');
  assignIfDefined('fulfillmentOption');
  assignIfDefined('notifyCustomers');
  assignIfDefined('fulfillHighRiskOrders');
  assignIfDefined('autoArchive');
  assignIfDefined('storeName');
  assignIfDefined('storeEmail');
  assignIfDefined('storePhone');
  assignIfDefined('legalBusinessName');
  assignIfDefined('billingCountry');
  assignIfDefined('billingAddress');
  assignIfDefined('billingApartment');
  assignIfDefined('billingCity');
  assignIfDefined('billingState');
  assignIfDefined('billingPinCode');

  return payload;
};

export const updateGeneralSettings = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };
  const { storeId } = req.body as { storeId?: string };

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid general settings id is required', 400);
  }

  const payload = extractPayload(req.body);

  // Update general settings
  const updated = await GeneralSettings.findByIdAndUpdate(id, { $set: payload }, { new: true });

  if (!updated) {
    throw new CustomError('General settings not found', 404);
  }

  // If storeName is being updated, also update the Store model using storeId from request
  if (payload.storeName !== undefined && storeId) {
    if (!mongoose.isValidObjectId(storeId)) {
      throw new CustomError('Valid storeId is required', 400);
    }
    await Store.findByIdAndUpdate(
      storeId,
      { $set: { storeName: payload.storeName } },
      { new: true }
    );
  }

  return res.status(200).json({ success: true, data: updated, message: 'General settings updated' });
});

export const getGeneralSettingsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId?: string };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const settings = await GeneralSettings.findOne({ storeId });

  return res.status(200).json({
    success: true,
    data: settings,
    message: settings ? 'General settings fetched' : 'No general settings found for this store',
  });
});


