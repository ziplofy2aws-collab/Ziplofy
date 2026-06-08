import { Request, Response } from "express";
import { ITaxAndDutiesGlobalSettings, TaxAndDutiesGlobalSettings } from "../models/tax-and-duties-global-settings/tax-and-duties-global-settings.model";
import { Store } from "../models/store/store.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import mongoose from "mongoose";

// Get tax and duties global settings by store ID
export const getTaxAndDutiesGlobalSettingsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  // Verify that the store exists
  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new CustomError("Store not found", 404);
  }

  let settings = await TaxAndDutiesGlobalSettings.findOne({
    storeId: new mongoose.Types.ObjectId(storeId),
  })
    .populate("storeId", "storeName");

  // If no settings exist, create default settings with all options set to false
  if (!settings) {
    const defaultSettingsData: Partial<ITaxAndDutiesGlobalSettings> = {
      storeId: new mongoose.Types.ObjectId(storeId),
      includeSalesTaxInProductPriceAndShippingRate: false,
      chargeSalesTaxOnShipping: false,
      chargeVATOnDigitalGoods: false,
    };

    const newSettings = await TaxAndDutiesGlobalSettings.create(defaultSettingsData);
    settings = await TaxAndDutiesGlobalSettings.findById(newSettings._id)
      .populate("storeId", "storeName");
  }

  res.status(200).json({
    success: true,
    data: settings,
    message: "Tax and duties global settings fetched successfully",
  });
});

// Update tax and duties global settings by ID
export const updateTaxAndDutiesGlobalSettings = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { includeSalesTaxInProductPriceAndShippingRate, chargeSalesTaxOnShipping, chargeVATOnDigitalGoods } = req.body;

  if (!id) {
    throw new CustomError("Settings ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid settings ID format", 400);
  }

  // Build update payload with only provided fields
  const updatePayload: Partial<ITaxAndDutiesGlobalSettings> = {};

  if (includeSalesTaxInProductPriceAndShippingRate !== undefined) {
    if (typeof includeSalesTaxInProductPriceAndShippingRate !== "boolean") {
      throw new CustomError("includeSalesTaxInProductPriceAndShippingRate must be a boolean", 400);
    }
    updatePayload.includeSalesTaxInProductPriceAndShippingRate = includeSalesTaxInProductPriceAndShippingRate;
  }

  if (chargeSalesTaxOnShipping !== undefined) {
    if (typeof chargeSalesTaxOnShipping !== "boolean") {
      throw new CustomError("chargeSalesTaxOnShipping must be a boolean", 400);
    }
    updatePayload.chargeSalesTaxOnShipping = chargeSalesTaxOnShipping;
  }

  if (chargeVATOnDigitalGoods !== undefined) {
    if (typeof chargeVATOnDigitalGoods !== "boolean") {
      throw new CustomError("chargeVATOnDigitalGoods must be a boolean", 400);
    }
    updatePayload.chargeVATOnDigitalGoods = chargeVATOnDigitalGoods;
  }

  // Check if there's anything to update
  if (Object.keys(updatePayload).length === 0) {
    throw new CustomError("No valid fields provided for update", 400);
  }

  // Update the settings
  const updatedSettings = await TaxAndDutiesGlobalSettings.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true, runValidators: true }
  )
    .populate("storeId", "storeName");

  if (!updatedSettings) {
    throw new CustomError("Tax and duties global settings not found", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedSettings,
    message: "Tax and duties global settings updated successfully",
  });
});

