"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingProfileProductVariantEntry = exports.createShippingProfileProductVariantEntry = exports.getShippingProfileProductVariantEntries = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const shipping_profile_product_variants_entry_model_1 = require("../models/shipping-profile/shipping-profile-product-variants-entry.model");
const shipping_profile_model_1 = require("../models/shipping-profile/shipping-profile.model");
const product_variants_model_1 = require("../models/product/product-variants.model");
exports.getShippingProfileProductVariantEntries = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { profileId } = req.params;
    if (!profileId || !mongoose_1.default.isValidObjectId(profileId)) {
        throw new error_utils_1.CustomError('Valid shipping profile ID is required', 400);
    }
    const profile = await shipping_profile_model_1.ShippingProfile.findById(profileId).select('_id').lean();
    if (!profile) {
        throw new error_utils_1.CustomError('Shipping profile not found', 404);
    }
    const entries = await shipping_profile_product_variants_entry_model_1.ShippingProfileProductVariantsEntry.find({ shippingProfileId: profileId })
        .populate({
        path: 'productVariantId',
        populate: {
            path: 'productId',
            select: 'title imageUrls',
        },
    })
        .lean();
    return res.status(200).json({
        success: true,
        data: entries,
        message: 'Shipping profile product variants fetched successfully',
        meta: {
            shippingProfileId: profileId,
            total: entries.length,
        },
    });
});
exports.createShippingProfileProductVariantEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { profileId } = req.params;
    const { productVariantId } = req.body;
    if (!profileId || !mongoose_1.default.isValidObjectId(profileId)) {
        throw new error_utils_1.CustomError('Valid shipping profile ID is required', 400);
    }
    if (!productVariantId || !mongoose_1.default.isValidObjectId(productVariantId)) {
        throw new error_utils_1.CustomError('Valid productVariantId is required', 400);
    }
    const profile = await shipping_profile_model_1.ShippingProfile.findById(profileId).lean();
    if (!profile) {
        throw new error_utils_1.CustomError('Shipping profile not found', 404);
    }
    const variant = await product_variants_model_1.ProductVariant.findById(productVariantId)
        .populate('productId', 'storeId')
        .lean();
    if (!variant) {
        throw new error_utils_1.CustomError('Product variant not found', 404);
    }
    const product = variant.productId;
    if (!product || String(product.storeId) !== String(profile.storeId)) {
        throw new error_utils_1.CustomError('Product variant does not belong to this store', 403);
    }
    const entry = await shipping_profile_product_variants_entry_model_1.ShippingProfileProductVariantsEntry.create({
        shippingProfileId: profileId,
        productVariantId,
        storeId: profile.storeId,
    });
    const populatedEntry = await shipping_profile_product_variants_entry_model_1.ShippingProfileProductVariantsEntry.findById(entry._id)
        .populate({
        path: 'productVariantId',
        populate: {
            path: 'productId',
            select: 'title imageUrls',
        },
    })
        .lean();
    return res.status(201).json({
        success: true,
        data: populatedEntry,
        message: 'Product variant added to shipping profile',
        meta: {
            shippingProfileId: profileId,
        },
    });
});
exports.deleteShippingProfileProductVariantEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid entry ID is required', 400);
    }
    const entry = await shipping_profile_product_variants_entry_model_1.ShippingProfileProductVariantsEntry.findById(id).lean();
    if (!entry) {
        throw new error_utils_1.CustomError('Shipping profile product variant entry not found', 404);
    }
    await shipping_profile_product_variants_entry_model_1.ShippingProfileProductVariantsEntry.findByIdAndDelete(id);
    return res.status(200).json({
        success: true,
        data: { deletedId: id },
        message: 'Product variant removed from shipping profile',
        meta: {
            shippingProfileId: String(entry.shippingProfileId),
        },
    });
});
