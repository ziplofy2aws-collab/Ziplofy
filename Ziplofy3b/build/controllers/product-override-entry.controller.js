"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductOverrideEntry = exports.getProductOverrideEntriesByProductOverrideId = exports.createProductOverrideEntry = void 0;
const product_override_entry_model_1 = require("../models/product-override/product-override-entry.model");
const product_override_model_1 = require("../models/product-override/product-override.model");
const error_utils_1 = require("../utils/error.utils");
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new product override entry
exports.createProductOverrideEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { productOverrideId, stateId, taxRate, isActive } = req.body;
    if (!productOverrideId) {
        throw new error_utils_1.CustomError("Product Override ID is required", 400);
    }
    if (taxRate === undefined || taxRate === null) {
        throw new error_utils_1.CustomError("Tax rate is required", 400);
    }
    if (taxRate < 0 || taxRate > 100) {
        throw new error_utils_1.CustomError("Tax rate must be between 0 and 100", 400);
    }
    // Validate ObjectIds
    if (!mongoose_1.default.Types.ObjectId.isValid(productOverrideId)) {
        throw new error_utils_1.CustomError("Invalid product override ID format", 400);
    }
    // Verify that the product override exists
    const productOverride = await product_override_model_1.ProductOverride.findById(productOverrideId);
    if (!productOverride) {
        throw new error_utils_1.CustomError("Product override not found", 404);
    }
    // Validate and check for duplicate state IDs
    if (stateId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(stateId)) {
            throw new error_utils_1.CustomError("Invalid state ID format", 400);
        }
        // Check if product override entry already exists for this productOverride-state combination
        // This prevents duplicate state IDs for the same product override
        const existingEntry = await product_override_entry_model_1.ProductOverrideEntry.findOne({
            productOverrideId: new mongoose_1.default.Types.ObjectId(productOverrideId),
            stateId: new mongoose_1.default.Types.ObjectId(stateId),
            isActive: true, // Only check active entries
        });
        if (existingEntry) {
            throw new error_utils_1.CustomError(`Product override entry already exists for this state. You cannot add the same state twice for this product override.`, 400);
        }
    }
    else {
        // Check for country-level entry (null stateId) - only one federal-level entry allowed per product override
        const existingEntry = await product_override_entry_model_1.ProductOverrideEntry.findOne({
            productOverrideId: new mongoose_1.default.Types.ObjectId(productOverrideId),
            stateId: null,
            isActive: true, // Only check active entries
        });
        if (existingEntry) {
            throw new error_utils_1.CustomError("Product override entry already exists for this product override at the federal level. You cannot add duplicate federal-level entries.", 400);
        }
    }
    const productOverrideEntryData = {
        productOverrideId: new mongoose_1.default.Types.ObjectId(productOverrideId),
        stateId: stateId ? new mongoose_1.default.Types.ObjectId(stateId) : null,
        taxRate,
        isActive: isActive !== undefined ? isActive : true,
    };
    const newProductOverrideEntry = await product_override_entry_model_1.ProductOverrideEntry.create(productOverrideEntryData);
    const populatedEntry = await product_override_entry_model_1.ProductOverrideEntry.findById(newProductOverrideEntry._id)
        .populate({
        path: "productOverrideId",
        populate: {
            path: "storeId",
            select: "storeName",
        },
    })
        .populate({
        path: "productOverrideId",
        populate: {
            path: "countryId",
            select: "name iso2",
        },
    })
        .populate({
        path: "productOverrideId",
        populate: {
            path: "collectionId",
            select: "title",
        },
    })
        .populate("stateId", "name code");
    res.status(201).json({
        success: true,
        data: populatedEntry,
        message: "Product override entry created successfully",
    });
});
// Get product override entries by product override ID
exports.getProductOverrideEntriesByProductOverrideId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { productOverrideId } = req.params;
    if (!productOverrideId) {
        throw new error_utils_1.CustomError("Product Override ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(productOverrideId)) {
        throw new error_utils_1.CustomError("Invalid product override ID format", 400);
    }
    // Verify that the product override exists
    const productOverride = await product_override_model_1.ProductOverride.findById(productOverrideId);
    if (!productOverride) {
        throw new error_utils_1.CustomError("Product override not found", 404);
    }
    const entries = await product_override_entry_model_1.ProductOverrideEntry.find({
        productOverrideId: new mongoose_1.default.Types.ObjectId(productOverrideId),
        isActive: true,
    })
        .populate({
        path: "productOverrideId",
        populate: {
            path: "storeId",
            select: "storeName",
        },
    })
        .populate({
        path: "productOverrideId",
        populate: {
            path: "countryId",
            select: "name iso2",
        },
    })
        .populate({
        path: "productOverrideId",
        populate: {
            path: "collectionId",
            select: "title",
        },
    })
        .populate("stateId", "name code")
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: entries,
        count: entries.length,
        message: "Product override entries retrieved successfully",
    });
});
// Delete a product override entry
exports.deleteProductOverrideEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new error_utils_1.CustomError("Product override entry ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid product override entry ID format", 400);
    }
    const deletedEntry = await product_override_entry_model_1.ProductOverrideEntry.findByIdAndDelete(id);
    if (!deletedEntry) {
        throw new error_utils_1.CustomError("Product override entry not found", 404);
    }
    res.status(200).json({
        success: true,
        data: {
            deletedEntry: {
                id: deletedEntry._id,
                productOverrideId: deletedEntry.productOverrideId,
                stateId: deletedEntry.stateId,
                taxRate: deletedEntry.taxRate,
            },
        },
        message: "Product override entry deleted successfully",
    });
});
