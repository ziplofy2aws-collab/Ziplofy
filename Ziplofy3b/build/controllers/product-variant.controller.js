"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantByIdPublic = exports.getVariantsByProductIdPublic = exports.updateVariantById = exports.getVariantById = exports.getVariantsByProductId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const product_variants_model_1 = require("../models/product/product-variants.model");
const product_model_1 = require("../models/product/product.model");
const error_utils_1 = require("../utils/error.utils");
const store_access_util_1 = require("../utils/store-access.util");
const cloud_storage_image_util_1 = require("../utils/cloud-storage-image.util");
const VARIANT_UPDATE_FIELDS = [
    "sku",
    "barcode",
    "price",
    "compareAtPrice",
    "cost",
    "profit",
    "marginPercent",
    "unitPriceTotalAmount",
    "unitPriceTotalAmountMetric",
    "unitPriceBaseMeasure",
    "unitPriceBaseMeasureMetric",
    "chargeTax",
    "weightValue",
    "weightUnit",
    "package",
    "countryOfOrigin",
    "hsCode",
    "images",
    "outOfStockContinueSelling",
    "isInventoryTrackingEnabled",
    "isPhysicalProduct",
];
function buildVariantUpdatePayload(body) {
    const updatePayload = {};
    for (const field of VARIANT_UPDATE_FIELDS) {
        if (!Object.prototype.hasOwnProperty.call(body, field))
            continue;
        updatePayload[field] = body[field];
    }
    if (Object.prototype.hasOwnProperty.call(updatePayload, "package")) {
        const pkg = updatePayload.package;
        if (pkg === null || pkg === "") {
            updatePayload.package = null;
        }
        else if (typeof pkg === "string" && !mongoose_1.default.isValidObjectId(pkg)) {
            throw new error_utils_1.CustomError("Invalid package id", 400);
        }
    }
    if (Object.prototype.hasOwnProperty.call(updatePayload, "sku")) {
        const sku = String(updatePayload.sku ?? "").trim();
        if (!sku)
            throw new error_utils_1.CustomError("SKU is required", 400);
        updatePayload.sku = sku;
    }
    return updatePayload;
}
// GET variants by product id
exports.getVariantsByProductId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        throw new error_utils_1.CustomError("productId is required", 400);
    }
    const product = await product_model_1.Product.findOne({ _id: productId, isDeleted: { $ne: true } }).select("_id");
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    const variants = await product_variants_model_1.ProductVariant.find({ productId, depricated: false })
        .populate({ path: 'package', model: 'Packaging' })
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: variants,
        count: variants.length,
    });
});
// GET single variant by id (protected route)
exports.getVariantById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { productId } = req.query;
    if (!id) {
        throw new error_utils_1.CustomError("variant id is required", 400);
    }
    const variant = await product_variants_model_1.ProductVariant.findOne({ _id: id, depricated: false })
        .populate({ path: 'package', model: 'Packaging' });
    if (!variant) {
        throw new error_utils_1.CustomError("Variant not found", 404);
    }
    if (productId && String(variant.productId) !== String(productId)) {
        throw new error_utils_1.CustomError("Variant does not belong to the provided product", 400);
    }
    const product = await product_model_1.Product.findOne({ _id: variant.productId, isDeleted: { $ne: true } }).select("_id");
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    res.status(200).json({
        success: true,
        data: variant,
    });
});
// PATCH update variant by id
exports.updateVariantById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid variant id is required", 400);
    }
    const updateData = buildVariantUpdatePayload(req.body);
    if (!Object.keys(updateData).length) {
        throw new error_utils_1.CustomError("No valid fields provided for update", 400);
    }
    const existingVariant = await product_variants_model_1.ProductVariant.findOne({ _id: id, depricated: false });
    if (!existingVariant) {
        throw new error_utils_1.CustomError("Variant not found", 404);
    }
    const product = await product_model_1.Product.findOne({ _id: existingVariant.productId, isDeleted: { $ne: true } }).select("storeId");
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    await (0, store_access_util_1.assertStoreAccess)(product.storeId.toString(), req.user);
    if (Array.isArray(updateData.images)) {
        await (0, cloud_storage_image_util_1.assertStoreCloudImageUrls)(product.storeId.toString(), updateData.images);
    }
    const updatedVariant = await product_variants_model_1.ProductVariant.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).populate({ path: "package", model: "Packaging" });
    if (!updatedVariant) {
        throw new error_utils_1.CustomError("Variant not found", 404);
    }
    res.status(200).json({
        success: true,
        data: updatedVariant,
        message: "Variant updated successfully",
    });
});
// Public route for getting variants by product id
exports.getVariantsByProductIdPublic = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        throw new error_utils_1.CustomError("productId is required", 400);
    }
    const product = await product_model_1.Product.findOne({ _id: productId, isDeleted: { $ne: true } }).select("_id");
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    const variants = await product_variants_model_1.ProductVariant.find({ productId, depricated: false })
        .select({
        cost: 0,
        profit: 0,
        marginPercent: 0,
        unitPriceTotalAmount: 0,
        unitPriceTotalAmountMetric: 0,
        unitPriceBaseMeasure: 0,
        unitPriceBaseMeasureMetric: 0,
        hsCode: 0,
        isInventoryTrackingEnabled: 0,
    });
    res.status(200).json({
        success: true,
        data: variants,
        count: variants.length,
    });
});
// Public route for getting single variant by id
exports.getVariantByIdPublic = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { productId } = req.query;
    if (!id) {
        throw new error_utils_1.CustomError("variant id is required", 400);
    }
    const variant = await product_variants_model_1.ProductVariant.findOne({ _id: id, depricated: false })
        .select({
        cost: 0,
        profit: 0,
        marginPercent: 0,
        unitPriceTotalAmount: 0,
        unitPriceTotalAmountMetric: 0,
        unitPriceBaseMeasure: 0,
        unitPriceBaseMeasureMetric: 0,
        hsCode: 0,
        isInventoryTrackingEnabled: 0,
    });
    if (!variant) {
        throw new error_utils_1.CustomError("Variant not found", 404);
    }
    if (productId && String(variant.productId) !== String(productId)) {
        throw new error_utils_1.CustomError("Variant does not belong to the provided product", 400);
    }
    const product = await product_model_1.Product.findOne({ _id: variant.productId, isDeleted: { $ne: true } }).select("_id");
    if (!product) {
        throw new error_utils_1.CustomError("Product not found", 404);
    }
    res.status(200).json({
        success: true,
        data: variant,
    });
});
