"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultPackaging = exports.deletePackaging = exports.updatePackaging = exports.getPackagingById = exports.getPackagingByStoreId = exports.createPackaging = void 0;
const packaging_model_1 = require("../models/packaging/packaging.model");
const store_model_1 = require("../models/store/store.model");
const error_utils_1 = require("../utils/error.utils");
// Create a new packaging
exports.createPackaging = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, packageName, packageType, length, width, height, dimensionsUnit, weight, weightUnit, isDefault } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    // Verify that the store belongs to the authenticated user
    const store = await store_model_1.Store.findOne({ _id: storeId, userId });
    if (!store) {
        throw new error_utils_1.CustomError("Store not found or you don't have permission to access this store", 404);
    }
    // Note: Removed duplicate name check to allow multiple packages with same name
    // If setting as default, unset other default packages for this store
    if (isDefault) {
        await packaging_model_1.Packaging.updateMany({ storeId, isDefault: true }, { isDefault: false });
    }
    const packaging = await packaging_model_1.Packaging.create({
        storeId,
        packageName,
        packageType,
        length,
        width,
        height,
        dimensionsUnit,
        weight,
        weightUnit,
        isDefault: isDefault || false,
    });
    res.status(201).json({
        success: true,
        data: packaging,
        message: "Packaging created successfully",
    });
});
// Get all packaging for a specific store
exports.getPackagingByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    // Verify that the store belongs to the authenticated user
    const store = await store_model_1.Store.findOne({ _id: storeId, userId });
    if (!store) {
        throw new error_utils_1.CustomError("Store not found or you don't have permission to access this store", 404);
    }
    const packaging = await packaging_model_1.Packaging.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: packaging,
        count: packaging.length,
    });
});
// Get a specific packaging by ID
exports.getPackagingById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    const packaging = await packaging_model_1.Packaging.findById(id);
    if (!packaging) {
        throw new error_utils_1.CustomError("Packaging not found", 404);
    }
    // Verify that the store belongs to the authenticated user
    const store = await store_model_1.Store.findOne({ _id: packaging.storeId, userId });
    if (!store) {
        throw new error_utils_1.CustomError("You don't have permission to access this packaging", 403);
    }
    res.status(200).json({
        success: true,
        data: packaging,
    });
});
// Update a packaging
exports.updatePackaging = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { packageName, packageType, length, width, height, dimensionsUnit, weight, weightUnit, isDefault } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    const packaging = await packaging_model_1.Packaging.findById(id);
    if (!packaging) {
        throw new error_utils_1.CustomError("Packaging not found", 404);
    }
    // Verify that the store belongs to the authenticated user
    const store = await store_model_1.Store.findOne({ _id: packaging.storeId, userId });
    if (!store) {
        throw new error_utils_1.CustomError("You don't have permission to update this packaging", 403);
    }
    // Note: Removed duplicate name check to allow multiple packages with same name
    // If setting as default, unset other default packages for this store
    if (isDefault && !packaging.isDefault) {
        await packaging_model_1.Packaging.updateMany({ storeId: packaging.storeId, isDefault: true }, { isDefault: false });
    }
    const updatedPackaging = await packaging_model_1.Packaging.findByIdAndUpdate(id, { packageName, packageType, length, width, height, dimensionsUnit, weight, weightUnit, isDefault }, { new: true, runValidators: true });
    res.status(200).json({
        success: true,
        data: updatedPackaging,
        message: "Packaging updated successfully",
    });
});
// Delete a packaging
exports.deletePackaging = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    const packaging = await packaging_model_1.Packaging.findById(id);
    if (!packaging) {
        throw new error_utils_1.CustomError("Packaging not found", 404);
    }
    // Verify that the store belongs to the authenticated user
    const store = await store_model_1.Store.findOne({ _id: packaging.storeId, userId });
    if (!store) {
        throw new error_utils_1.CustomError("You don't have permission to delete this packaging", 403);
    }
    const deletedPackaging = await packaging_model_1.Packaging.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        data: {
            deletedId: id,
            deletedPackaging: deletedPackaging
        },
        message: "Packaging deleted successfully",
    });
});
// Get default packaging for a store
exports.getDefaultPackaging = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    // Verify that the store belongs to the authenticated user
    const store = await store_model_1.Store.findOne({ _id: storeId, userId });
    if (!store) {
        throw new error_utils_1.CustomError("Store not found or you don't have permission to access this store", 404);
    }
    const defaultPackaging = await packaging_model_1.Packaging.findOne({ storeId, isDefault: true });
    res.status(200).json({
        success: true,
        data: defaultPackaging,
    });
});
