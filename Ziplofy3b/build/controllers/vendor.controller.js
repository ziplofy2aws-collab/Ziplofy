"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorsByStoreId = exports.deleteVendor = exports.addVendor = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const vendor_model_1 = require("../models/vendor/vendor.model");
const error_utils_1 = require("../utils/error.utils");
// Add a new vendor
exports.addVendor = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name } = req.body;
    // Validate required fields
    if (!storeId || !name) {
        throw new error_utils_1.CustomError("Store ID and vendor name are required", 400);
    }
    // Validate storeId format
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    // Check if vendor already exists for this store
    const existingVendor = await vendor_model_1.Vendor.findOne({ storeId, name: name.trim() });
    if (existingVendor) {
        throw new error_utils_1.CustomError("Vendor with this name already exists for this store", 409);
    }
    // Create new vendor
    const vendor = new vendor_model_1.Vendor({
        storeId,
        name: name.trim()
    });
    const savedVendor = await vendor.save();
    res.status(201).json({
        success: true,
        message: "Vendor created successfully",
        data: savedVendor
    });
});
// Delete a vendor
exports.deleteVendor = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    // Validate vendor ID format
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid vendor ID format", 400);
    }
    // Find and delete the vendor
    const vendor = await vendor_model_1.Vendor.findByIdAndDelete(id);
    if (!vendor) {
        throw new error_utils_1.CustomError("Vendor not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Vendor deleted successfully",
        data: {
            deletedVendor: {
                id: vendor._id,
                storeId: vendor.storeId,
                name: vendor.name
            }
        }
    });
});
// Get vendors by storeId
exports.getVendorsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError("storeId is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    const vendors = await vendor_model_1.Vendor.find({ storeId }).sort({ name: 1 });
    res.status(200).json({
        success: true,
        data: vendors,
        count: vendors.length,
    });
});
