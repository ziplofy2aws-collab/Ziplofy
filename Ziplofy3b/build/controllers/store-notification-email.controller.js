"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyStoreNotificationEmail = exports.sendStoreNotificationEmailVerification = exports.getStoreNotificationEmailByStoreId = exports.updateStoreNotificationEmail = exports.createStoreNotificationEmail = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const email_templates_1 = require("../email-templates");
const store_email_verification_model_1 = require("../models/store-email-verification/store-email-verification.model");
const store_notification_email_model_1 = require("../models/store-notification-email/store-notification-email.model");
const store_model_1 = require("../models/store/store.model");
const email_utils_1 = require("../utils/email.utils");
const error_utils_1 = require("../utils/error.utils");
const store_email_verification_utils_1 = require("../utils/store-email-verification.utils");
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
async function assertStoreAccess(storeId, user) {
    if (!user) {
        throw new error_utils_1.CustomError("Not authorized to access this route", 401);
    }
    if (user.superAdmin) {
        return;
    }
    const store = await store_model_1.Store.findById(storeId).select("userId").lean();
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
    if (store.userId.toString() !== user.id) {
        throw new error_utils_1.CustomError("You do not have permission to manage this store", 403);
    }
}
// Create a new store notification email
exports.createStoreNotificationEmail = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, email } = req.body;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!email) {
        throw new error_utils_1.CustomError("Email is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
        throw new error_utils_1.CustomError("Please enter a valid email", 400);
    }
    const store = await store_model_1.Store.findById(storeId).lean();
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
    await assertStoreAccess(storeId, req.user);
    // Check if store notification email already exists for this store
    const existing = await store_notification_email_model_1.StoreNotificationEmail.findOne({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
    });
    if (existing) {
        throw new error_utils_1.CustomError("Store notification email already exists for this store. Please use the update endpoint instead.", 400);
    }
    const storeNotificationEmailData = {
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        email: email.trim().toLowerCase(),
        isVerified: false,
    };
    const newStoreNotificationEmail = await store_notification_email_model_1.StoreNotificationEmail.create(storeNotificationEmailData);
    const populatedStoreNotificationEmail = await store_notification_email_model_1.StoreNotificationEmail.findById(newStoreNotificationEmail._id)
        .populate("storeId", "storeName");
    res.status(201).json({
        success: true,
        data: populatedStoreNotificationEmail,
        message: "Store notification email created successfully",
    });
});
// Update store notification email by ID
exports.updateStoreNotificationEmail = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    if (!id) {
        throw new error_utils_1.CustomError("Store notification email ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid store notification email ID format", 400);
    }
    const existingRecord = await store_notification_email_model_1.StoreNotificationEmail.findById(id);
    if (!existingRecord) {
        throw new error_utils_1.CustomError("Store notification email not found", 404);
    }
    await assertStoreAccess(existingRecord.storeId.toString(), req.user);
    // Build update payload with only provided fields
    const updatePayload = {};
    if (email !== undefined) {
        if (!email || typeof email !== "string" || email.trim().length === 0) {
            throw new error_utils_1.CustomError("Email cannot be empty", 400);
        }
        if (!EMAIL_REGEX.test(email)) {
            throw new error_utils_1.CustomError("Please enter a valid email", 400);
        }
        const normalizedEmail = email.trim().toLowerCase();
        updatePayload.email = normalizedEmail;
        if (normalizedEmail !== existingRecord.email) {
            updatePayload.isVerified = false;
            await store_email_verification_model_1.StoreEmailVerification.deleteMany({
                storeNotificationEmailId: existingRecord._id,
            });
        }
    }
    // Check if there's anything to update
    if (Object.keys(updatePayload).length === 0) {
        throw new error_utils_1.CustomError("No valid fields provided for update", 400);
    }
    // Update the store notification email
    const updatedStoreNotificationEmail = await store_notification_email_model_1.StoreNotificationEmail.findByIdAndUpdate(id, { $set: updatePayload }, { new: true, runValidators: true })
        .populate("storeId", "storeName");
    if (!updatedStoreNotificationEmail) {
        throw new error_utils_1.CustomError("Store notification email not found", 404);
    }
    res.status(200).json({
        success: true,
        data: updatedStoreNotificationEmail,
        message: "Store notification email updated successfully",
    });
});
// Get store notification email by store ID
exports.getStoreNotificationEmailByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    const storeNotificationEmail = await store_notification_email_model_1.StoreNotificationEmail.findOne({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
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
exports.sendStoreNotificationEmailVerification = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid store notification email ID format", 400);
    }
    const storeNotificationEmail = await store_notification_email_model_1.StoreNotificationEmail.findById(id);
    if (!storeNotificationEmail) {
        throw new error_utils_1.CustomError("Store notification email not found", 404);
    }
    await assertStoreAccess(storeNotificationEmail.storeId.toString(), req.user);
    if (storeNotificationEmail.isVerified) {
        throw new error_utils_1.CustomError("Sender email is already verified", 400);
    }
    const store = await store_model_1.Store.findById(storeNotificationEmail.storeId).select("storeName").lean();
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
    await store_email_verification_model_1.StoreEmailVerification.deleteMany({
        storeNotificationEmailId: storeNotificationEmail._id,
    });
    const token = (0, store_email_verification_utils_1.createStoreSenderEmailVerificationToken)({
        storeId: storeNotificationEmail.storeId.toString(),
        storeNotificationEmailId: storeNotificationEmail._id.toString(),
        email: storeNotificationEmail.email,
    });
    const tokenHash = (0, store_email_verification_utils_1.hashVerificationToken)(token);
    const expiresAt = (0, store_email_verification_utils_1.getStoreSenderEmailVerificationExpiryDate)();
    await store_email_verification_model_1.StoreEmailVerification.create({
        storeId: storeNotificationEmail.storeId,
        storeNotificationEmailId: storeNotificationEmail._id,
        email: storeNotificationEmail.email,
        tokenHash,
        expiresAt,
    });
    const verifyUrl = (0, email_templates_1.buildStoreSenderEmailVerificationUrl)(token);
    const verificationEmail = (0, email_templates_1.buildStoreSenderEmailVerificationEmail)({
        storeName: store.storeName,
        verifyUrl,
    });
    await (0, email_utils_1.sendEmail)({
        to: storeNotificationEmail.email,
        subject: verificationEmail.subject,
        body: verificationEmail.html,
        url: verifyUrl,
    });
    res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
    });
});
// POST /api/store-notification-email/verify
exports.verifyStoreNotificationEmail = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    if (!token) {
        throw new error_utils_1.CustomError("Verification token is required", 400);
    }
    let payload;
    try {
        payload = (0, store_email_verification_utils_1.verifyStoreSenderEmailVerificationToken)(token);
    }
    catch {
        throw new error_utils_1.CustomError("Invalid or expired verification token", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(payload.storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID in verification token", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(payload.storeNotificationEmailId)) {
        throw new error_utils_1.CustomError("Invalid sender email ID in verification token", 400);
    }
    const tokenHash = (0, store_email_verification_utils_1.hashVerificationToken)(token);
    const verificationRecord = await store_email_verification_model_1.StoreEmailVerification.findOne({
        tokenHash,
        expiresAt: { $gt: new Date() },
    });
    if (!verificationRecord) {
        throw new error_utils_1.CustomError("Invalid or expired verification token", 400);
    }
    if (verificationRecord.storeId.toString() !== payload.storeId) {
        throw new error_utils_1.CustomError("Verification token does not match store", 400);
    }
    if (verificationRecord.storeNotificationEmailId.toString() !== payload.storeNotificationEmailId) {
        throw new error_utils_1.CustomError("Verification token does not match sender email record", 400);
    }
    if (verificationRecord.email !== payload.email.trim().toLowerCase()) {
        throw new error_utils_1.CustomError("Verification token does not match email", 400);
    }
    const storeNotificationEmail = await store_notification_email_model_1.StoreNotificationEmail.findOne({
        _id: payload.storeNotificationEmailId,
        storeId: payload.storeId,
        email: payload.email.trim().toLowerCase(),
    });
    if (!storeNotificationEmail) {
        throw new error_utils_1.CustomError("Sender email record not found for verification", 404);
    }
    storeNotificationEmail.isVerified = true;
    await storeNotificationEmail.save();
    await store_email_verification_model_1.StoreEmailVerification.deleteMany({
        storeNotificationEmailId: storeNotificationEmail._id,
    });
    const populatedStoreNotificationEmail = await store_notification_email_model_1.StoreNotificationEmail.findById(storeNotificationEmail._id)
        .populate("storeId", "storeName");
    res.status(200).json({
        success: true,
        data: populatedStoreNotificationEmail,
        message: "Sender email verified successfully",
    });
});
