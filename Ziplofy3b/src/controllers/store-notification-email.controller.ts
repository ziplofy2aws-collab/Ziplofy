import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  buildStoreSenderEmailVerificationEmail,
  buildStoreSenderEmailVerificationUrl,
} from "../email-templates";
import { StoreEmailVerification } from "../models/store-email-verification/store-email-verification.model";
import { IStoreNotificationEmail, StoreNotificationEmail } from "../models/store-notification-email/store-notification-email.model";
import { Store } from "../models/store/store.model";
import { SecureUserInfo } from "../middlewares/auth.middleware";
import { sendEmail } from "../utils/email.utils";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";
import {
  createStoreSenderEmailVerificationToken,
  getStoreSenderEmailVerificationExpiryDate,
  hashVerificationToken,
  verifyStoreSenderEmailVerificationToken,
} from "../utils/store-email-verification.utils";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

async function assertStoreAccess(storeId: string, user: SecureUserInfo | undefined): Promise<void> {
  if (!user) {
    throw new CustomError("Not authorized to access this route", 401);
  }

  if (user.superAdmin) {
    return;
  }

  const store = await Store.findById(storeId).select("userId").lean();
  if (!store) {
    throw new CustomError("Store not found", 404);
  }

  if (store.userId.toString() !== user.id) {
    throw new CustomError("You do not have permission to manage this store", 403);
  }
}

// Create a new store notification email
export const createStoreNotificationEmail = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, email } = req.body;

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
  if (!EMAIL_REGEX.test(email)) {
    throw new CustomError("Please enter a valid email", 400);
  }

  const store = await Store.findById(storeId).lean();
  if (!store) {
    throw new CustomError("Store not found", 404);
  }

  await assertStoreAccess(storeId, req.user as SecureUserInfo | undefined);

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
    isVerified: false,
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
  const { email } = req.body;

  if (!id) {
    throw new CustomError("Store notification email ID is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid store notification email ID format", 400);
  }

  const existingRecord = await StoreNotificationEmail.findById(id);
  if (!existingRecord) {
    throw new CustomError("Store notification email not found", 404);
  }

  await assertStoreAccess(existingRecord.storeId.toString(), req.user as SecureUserInfo | undefined);

  // Build update payload with only provided fields
  const updatePayload: Partial<IStoreNotificationEmail> = {};

  if (email !== undefined) {
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      throw new CustomError("Email cannot be empty", 400);
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new CustomError("Please enter a valid email", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    updatePayload.email = normalizedEmail;

    if (normalizedEmail !== existingRecord.email) {
      updatePayload.isVerified = false;
      await StoreEmailVerification.deleteMany({
        storeNotificationEmailId: existingRecord._id,
      });
    }
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

// POST /api/store-notification-email/:id/send-verification
export const sendStoreNotificationEmailVerification = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError("Invalid store notification email ID format", 400);
    }

    const storeNotificationEmail = await StoreNotificationEmail.findById(id);
    if (!storeNotificationEmail) {
      throw new CustomError("Store notification email not found", 404);
    }

    await assertStoreAccess(storeNotificationEmail.storeId.toString(), req.user as SecureUserInfo | undefined);

    if (storeNotificationEmail.isVerified) {
      throw new CustomError("Sender email is already verified", 400);
    }

    const store = await Store.findById(storeNotificationEmail.storeId).select("storeName").lean();
    if (!store) {
      throw new CustomError("Store not found", 404);
    }

    await StoreEmailVerification.deleteMany({
      storeNotificationEmailId: storeNotificationEmail._id,
    });

    const token = createStoreSenderEmailVerificationToken({
      storeId: storeNotificationEmail.storeId.toString(),
      storeNotificationEmailId: storeNotificationEmail._id.toString(),
      email: storeNotificationEmail.email,
    });

    const tokenHash = hashVerificationToken(token);
    const expiresAt = getStoreSenderEmailVerificationExpiryDate();

    await StoreEmailVerification.create({
      storeId: storeNotificationEmail.storeId,
      storeNotificationEmailId: storeNotificationEmail._id,
      email: storeNotificationEmail.email,
      tokenHash,
      expiresAt,
    });

    const verifyUrl = buildStoreSenderEmailVerificationUrl(token);
    const verificationEmail = buildStoreSenderEmailVerificationEmail({
      storeName: store.storeName,
      verifyUrl,
    });

    await sendEmail({
      to: storeNotificationEmail.email,
      subject: verificationEmail.subject,
      body: verificationEmail.html,
      url: verifyUrl,
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  }
);

// POST /api/store-notification-email/verify
export const verifyStoreNotificationEmail = asyncErrorHandler(async (req: Request, res: Response) => {
  const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";

  if (!token) {
    throw new CustomError("Verification token is required", 400);
  }

  let payload;
  try {
    payload = verifyStoreSenderEmailVerificationToken(token);
  } catch {
    throw new CustomError("Invalid or expired verification token", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(payload.storeId)) {
    throw new CustomError("Invalid store ID in verification token", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(payload.storeNotificationEmailId)) {
    throw new CustomError("Invalid sender email ID in verification token", 400);
  }

  const tokenHash = hashVerificationToken(token);
  const verificationRecord = await StoreEmailVerification.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!verificationRecord) {
    throw new CustomError("Invalid or expired verification token", 400);
  }

  if (verificationRecord.storeId.toString() !== payload.storeId) {
    throw new CustomError("Verification token does not match store", 400);
  }

  if (verificationRecord.storeNotificationEmailId.toString() !== payload.storeNotificationEmailId) {
    throw new CustomError("Verification token does not match sender email record", 400);
  }

  if (verificationRecord.email !== payload.email.trim().toLowerCase()) {
    throw new CustomError("Verification token does not match email", 400);
  }

  const storeNotificationEmail = await StoreNotificationEmail.findOne({
    _id: payload.storeNotificationEmailId,
    storeId: payload.storeId,
    email: payload.email.trim().toLowerCase(),
  });

  if (!storeNotificationEmail) {
    throw new CustomError("Sender email record not found for verification", 404);
  }

  storeNotificationEmail.isVerified = true;
  await storeNotificationEmail.save();

  await StoreEmailVerification.deleteMany({
    storeNotificationEmailId: storeNotificationEmail._id,
  });

  const populatedStoreNotificationEmail = await StoreNotificationEmail.findById(storeNotificationEmail._id)
    .populate("storeId", "storeName");

  res.status(200).json({
    success: true,
    data: populatedStoreNotificationEmail,
    message: "Sender email verified successfully",
  });
});

