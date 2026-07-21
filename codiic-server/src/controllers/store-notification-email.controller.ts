import { Request, Response } from "express";
import { IStoreNotificationEmail, StoreNotificationEmail } from "../models/store-notification-email/store-notification-email.model";
import { Store } from "../models/store/store.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import mongoose from "mongoose";

// Create a new store notification email
export const createStoreNotificationEmail = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, email, isVerified } = req.body;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!email) {
    throw new CustomError("Email is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    throw new CustomError("Please enter a valid email", 400);
  }

  // Verify that the store exists
  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new CustomError("Store not found", 404);
  }

  // Check if store notification email already exists for this store
  const existing = await StoreNotificationEmail.findOne({
    storeId: new mongoose.Types.ObjectId(storeId),
  });

  if (existing) {
    throw new CustomError("Store notification email already exists for this store. Please use the update endpoint instead.", 400);
  }

  const storeNotificationEmailData: Partial<IStoreNotificationEmail> = {
    storeId: new mongoose.Types.ObjectId(storeId),
    email: email.trim().toLowerCase(),
    isVerified: isVerified !== undefined ? isVerified : false,
  };

  const newStoreNotificationEmail = await StoreNotificationEmail.create(storeNotificationEmailData);

  const populatedStoreNotificationEmail = await StoreNotificationEmail.findById(newStoreNotificationEmail._id)
    .populate("storeId", "storeName");

  res.status(201).json({
    success: true,
    data: populatedStoreNotificationEmail,
    message: "Store notification email created successfully",
  });
});

// Update store notification email by ID
export const updateStoreNotificationEmail = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, isVerified } = req.body;

  if (!id) {
    throw new CustomError("Store notification email ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid store notification email ID format", 400);
  }

  // Build update payload with only provided fields
  const updatePayload: Partial<IStoreNotificationEmail> = {};

  if (email !== undefined) {
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      throw new CustomError("Email cannot be empty", 400);
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw new CustomError("Please enter a valid email", 400);
    }

    updatePayload.email = email.trim().toLowerCase();
  }

  if (isVerified !== undefined) {
    if (typeof isVerified !== "boolean") {
      throw new CustomError("isVerified must be a boolean", 400);
    }
    updatePayload.isVerified = isVerified;
  }

  // Check if there's anything to update
  if (Object.keys(updatePayload).length === 0) {
    throw new CustomError("No valid fields provided for update", 400);
  }

  // Update the store notification email
  const updatedStoreNotificationEmail = await StoreNotificationEmail.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true, runValidators: true }
  )
    .populate("storeId", "storeName");

  if (!updatedStoreNotificationEmail) {
    throw new CustomError("Store notification email not found", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedStoreNotificationEmail,
    message: "Store notification email updated successfully",
  });
});

// Get store notification email by store ID
export const getStoreNotificationEmailByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId) {
    throw new CustomError("Store ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  const storeNotificationEmail = await StoreNotificationEmail.findOne({
    storeId: new mongoose.Types.ObjectId(storeId),
  })
    .populate("storeId", "storeName");

  res.status(200).json({
    success: true,
    data: storeNotificationEmail,
    message: storeNotificationEmail
      ? "Store notification email fetched successfully"
      : "No store notification email found for this store",
  });
});

