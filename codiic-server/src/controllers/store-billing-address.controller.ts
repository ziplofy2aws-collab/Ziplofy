import { Request, Response } from "express";
import mongoose from "mongoose";
import { StoreBillingAddress, IStoreBillingAddress } from "../models/store-billing-address/store-billing-address.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

// Create billing address for a store
export const createStoreBillingAddress = asyncErrorHandler(async (req: Request, res: Response) => {
  const payload = req.body as Omit<IStoreBillingAddress, "_id" | "createdAt" | "updatedAt">;

  if (!payload.storeId) throw new CustomError("Store ID is required", 400);
  if (!mongoose.Types.ObjectId.isValid(String(payload.storeId))) throw new CustomError("Invalid store ID format", 400);

  const created = await StoreBillingAddress.create({
    storeId: payload.storeId,
    legalBusinessName: payload.legalBusinessName,
    country: payload.country,
    address: payload.address,
    apartment: payload.apartment,
    city: payload.city,
    state: payload.state,
    pinCode: payload.pinCode,
  });

  res.status(201).json({ success: true, message: "Store billing address created", data: created });
});

// Update billing address by id
export const updateStoreBillingAddress = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new CustomError("Invalid billing address ID", 400);

  const updated = await StoreBillingAddress.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!updated) throw new CustomError("Store billing address not found", 404);

  res.status(200).json({ success: true, message: "Store billing address updated", data: updated });
});

// Delete billing address by id
export const deleteStoreBillingAddress = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new CustomError("Invalid billing address ID", 400);

  const deleted = await StoreBillingAddress.findByIdAndDelete(id);
  if (!deleted) throw new CustomError("Store billing address not found", 404);

  res.status(200).json({ success: true, message: "Store billing address deleted", data: { id: deleted._id } });
});

// Get billing addresses by storeId
export const getStoreBillingAddressesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(storeId)) throw new CustomError("Invalid store ID format", 400);

  const addresses = await StoreBillingAddress.find({ storeId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, message: "Store billing addresses fetched", data: addresses, count: addresses.length });
});


