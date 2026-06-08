"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductOverride = exports.updateProductOverride = exports.getProductOverrideById = exports.getProductOverridesByStoreAndCountry = exports.createProductOverride = void 0;
const product_override_model_1 = require("../models/product-override/product-override.model");
const error_utils_1 = require("../utils/error.utils");
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new product override
exports.createProductOverride = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, countryId, collectionId } = req.body;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!collectionId) {
        throw new error_utils_1.CustomError("Collection ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(collectionId)) {
        throw new error_utils_1.CustomError("Invalid collection ID", 400);
    }
    const normalizedStoreId = new mongoose_1.default.Types.ObjectId(storeId);
    const normalizedCountryId = new mongoose_1.default.Types.ObjectId(countryId);
    const normalizedCollectionId = new mongoose_1.default.Types.ObjectId(collectionId);
    // Check if product override already exists for this store-country-collection combination
    const existingProductOverride = await product_override_model_1.ProductOverride.findOne({
        storeId: normalizedStoreId,
        countryId: normalizedCountryId,
        collectionId: normalizedCollectionId,
    });
    if (existingProductOverride) {
        throw new error_utils_1.CustomError("Product override already exists for this store, country, and collection combination", 400);
    }
    const productOverrideData = {
        storeId: normalizedStoreId,
        countryId: normalizedCountryId,
        collectionId: normalizedCollectionId,
    };
    const newProductOverride = await product_override_model_1.ProductOverride.create(productOverrideData);
    const populatedProductOverride = await product_override_model_1.ProductOverride.findById(newProductOverride._id)
        .populate('storeId', 'storeName')
        .populate('countryId', 'name iso2')
        .populate('collectionId', 'title');
    res.status(201).json({
        success: true,
        data: populatedProductOverride,
        message: "Product override created successfully",
    });
});
// Get product overrides by store ID and country ID
exports.getProductOverridesByStoreAndCountry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, countryId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    if (!countryId) {
        throw new error_utils_1.CustomError("Country ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
        throw new error_utils_1.CustomError("Invalid country ID", 400);
    }
    const productOverrides = await product_override_model_1.ProductOverride.find({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        countryId: new mongoose_1.default.Types.ObjectId(countryId),
    })
        .populate('storeId', 'storeName')
        .populate('countryId', 'name iso2')
        .populate('collectionId', 'title')
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: productOverrides,
        count: productOverrides.length,
    });
});
// Get product override by ID
exports.getProductOverrideById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new error_utils_1.CustomError("Product override ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid product override ID", 400);
    }
    const productOverride = await product_override_model_1.ProductOverride.findById(id)
        .populate('storeId', 'storeName')
        .populate('countryId', 'name iso2')
        .populate('collectionId', 'title');
    if (!productOverride) {
        throw new error_utils_1.CustomError("Product override not found", 404);
    }
    res.status(200).json({
        success: true,
        data: productOverride,
    });
});
// Update a product override
exports.updateProductOverride = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId, countryId, collectionId } = req.body;
    if (!id) {
        throw new error_utils_1.CustomError("Product override ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid product override ID", 400);
    }
    const update = {};
    if (!storeId && !countryId && !collectionId) {
        throw new error_utils_1.CustomError("At least one field (storeId, countryId, collectionId) must be provided", 400);
    }
    if (storeId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
            throw new error_utils_1.CustomError("Invalid store ID", 400);
        }
        update.storeId = new mongoose_1.default.Types.ObjectId(storeId);
    }
    if (countryId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(countryId)) {
            throw new error_utils_1.CustomError("Invalid country ID", 400);
        }
        update.countryId = new mongoose_1.default.Types.ObjectId(countryId);
    }
    if (collectionId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(collectionId)) {
            throw new error_utils_1.CustomError("Invalid collection ID", 400);
        }
        update.collectionId = new mongoose_1.default.Types.ObjectId(collectionId);
    }
    const existing = await product_override_model_1.ProductOverride.findById(id);
    if (!existing) {
        throw new error_utils_1.CustomError("Product override not found", 404);
    }
    const mergedStoreId = update.storeId ?? existing.storeId;
    const mergedCountryId = update.countryId ?? existing.countryId;
    const mergedCollectionId = update.collectionId ?? existing.collectionId;
    const duplicate = await product_override_model_1.ProductOverride.findOne({
        _id: { $ne: existing._id },
        storeId: mergedStoreId,
        countryId: mergedCountryId,
        collectionId: mergedCollectionId,
    });
    if (duplicate) {
        throw new error_utils_1.CustomError("Another product override already exists for this store, country, and collection combination", 400);
    }
    existing.set(update);
    await existing.save();
    const updatedProductOverride = await product_override_model_1.ProductOverride.findById(existing._id)
        .populate('storeId', 'storeName')
        .populate('countryId', 'name iso2')
        .populate('collectionId', 'title');
    res.status(200).json({
        success: true,
        data: updatedProductOverride,
        message: "Product override updated successfully",
    });
});
// Delete a product override
exports.deleteProductOverride = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new error_utils_1.CustomError("Product override ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid product override ID", 400);
    }
    const deletedProductOverride = await product_override_model_1.ProductOverride.findByIdAndDelete(id);
    if (!deletedProductOverride) {
        throw new error_utils_1.CustomError("Product override not found", 404);
    }
    res.status(200).json({
        success: true,
        data: {},
        message: "Product override deleted successfully",
    });
});
