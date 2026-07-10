"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantByIdPublic = exports.getVariantsByProductIdPublic = exports.updateVariantById = exports.getVariantById = exports.getVariantsByProductId = void 0;
const product_variants_model_1 = require("../models/product/product-variants.model");
const product_model_1 = require("../models/product/product.model");
const error_utils_1 = require("../utils/error.utils");
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
// PUT update variant by id
exports.updateVariantById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    if (!id) {
        throw new error_utils_1.CustomError("Variant id is required", 400);
    }
    // Validate that variant exists
    const existingVariant = await product_variants_model_1.ProductVariant.findById(id);
    if (!existingVariant) {
        throw new error_utils_1.CustomError("Variant not found", 404);
    }
    // Update the variant with new data
    const updatedVariant = await product_variants_model_1.ProductVariant.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    }).populate({ path: 'package', model: 'Packaging' });
    res.status(200).json({
        success: true,
        data: updatedVariant,
        message: 'Variant updated successfully',
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
