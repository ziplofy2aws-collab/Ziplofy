"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreNotificationEmailByStoreId = exports.updateStoreNotificationEmail = exports.createStoreNotificationEmail = void 0;
const store_notification_email_model_1 = require("../models/store-notification-email/store-notification-email.model");
const store_model_1 = require("../models/store/store.model");
const error_utils_1 = require("../utils/error.utils");
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new store notification email
exports.createStoreNotificationEmail = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, email, isVerified } = req.body;
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
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        throw new error_utils_1.CustomError("Please enter a valid email", 400);
    }
    // Verify that the store exists
    const store = await store_model_1.Store.findById(storeId).lean();
    if (!store) {
        throw new error_utils_1.CustomError("Store not found", 404);
    }
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
        isVerified: isVerified !== undefined ? isVerified : false,
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
    const { email, isVerified } = req.body;
    if (!id) {
        throw new error_utils_1.CustomError("Store notification email ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid store notification email ID format", 400);
    }
    // Build update payload with only provided fields
    const updatePayload = {};
    if (email !== undefined) {
        if (!email || typeof email !== "string" || email.trim().length === 0) {
            throw new error_utils_1.CustomError("Email cannot be empty", 400);
        }
        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            throw new error_utils_1.CustomError("Please enter a valid email", 400);
        }
        updatePayload.email = email.trim().toLowerCase();
    }
    if (isVerified !== undefined) {
        if (typeof isVerified !== "boolean") {
            throw new error_utils_1.CustomError("isVerified must be a boolean", 400);
        }
        updatePayload.isVerified = isVerified;
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
