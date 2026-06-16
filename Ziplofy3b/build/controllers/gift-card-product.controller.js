"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGiftCardProduct = exports.updateGiftCardProduct = exports.getGiftCardProductById = exports.getGiftCardProductsByStoreId = exports.createGiftCardProduct = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const gift_card_product_model_1 = require("../models/gift-cards/gift-card-product.model");
const error_utils_1 = require("../utils/error.utils");
function slugifyHandle(input) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
function normalizeDenominations(values) {
    if (!Array.isArray(values)) {
        throw new error_utils_1.CustomError('denominations must be an array of positive numbers', 400);
    }
    const parsed = values
        .map((value) => (typeof value === 'string' ? parseFloat(value) : Number(value)))
        .filter((value) => Number.isFinite(value) && value > 0);
    if (!parsed.length) {
        throw new error_utils_1.CustomError('At least one valid denomination is required', 400);
    }
    return parsed;
}
function normalizeRedemptionScope(value) {
    if (value === 'store' || value === 'store_currency')
        return 'store_currency';
    return 'all_currencies';
}
exports.createGiftCardProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const body = req.body;
    if (!body.storeId || !body.title?.trim()) {
        throw new error_utils_1.CustomError('storeId and title are required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(body.storeId)) {
        throw new error_utils_1.CustomError('Invalid storeId', 400);
    }
    const denominations = normalizeDenominations(body.denominations);
    const urlHandle = (body.urlHandle || '').trim() ||
        slugifyHandle(body.title) ||
        `gift-card-product-${Date.now()}`;
    const giftCardProduct = await gift_card_product_model_1.GiftCardProduct.create({
        storeId: body.storeId,
        title: body.title.trim(),
        description: body.description?.trim() || '',
        imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : [],
        denominations,
        storeCurrencyCode: body.storeCurrencyCode?.trim() || 'INR',
        redemptionScope: normalizeRedemptionScope(body.redemptionScope),
        status: body.status === 'active' ? 'active' : 'draft',
        pageTitle: body.pageTitle?.trim() || body.title.trim(),
        metaDescription: body.metaDescription?.trim() || '',
        urlHandle,
        productType: body.productType && mongoose_1.default.isValidObjectId(body.productType) ? body.productType : null,
        vendor: body.vendor && mongoose_1.default.isValidObjectId(body.vendor) ? body.vendor : null,
        tagIds: Array.isArray(body.tagIds)
            ? body.tagIds.filter((id) => mongoose_1.default.isValidObjectId(id))
            : [],
        themeTemplate: body.themeTemplate?.trim() || 'default-product',
        giftCardTemplate: body.giftCardTemplate?.trim() || 'gift_card',
    });
    res.status(201).json({
        success: true,
        data: giftCardProduct,
        message: 'Gift card product created successfully',
    });
});
exports.getGiftCardProductsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId) {
        throw new error_utils_1.CustomError('storeId is required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Invalid storeId', 400);
    }
    const products = await gift_card_product_model_1.GiftCardProduct.find({ storeId, isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: products,
        count: products.length,
    });
});
exports.getGiftCardProductById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid gift card product id', 400);
    }
    const product = await gift_card_product_model_1.GiftCardProduct.findOne({ _id: id, isDeleted: false });
    if (!product) {
        throw new error_utils_1.CustomError('Gift card product not found', 404);
    }
    res.status(200).json({
        success: true,
        data: product,
    });
});
exports.updateGiftCardProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid gift card product id', 400);
    }
    const existing = await gift_card_product_model_1.GiftCardProduct.findOne({ _id: id, isDeleted: false });
    if (!existing) {
        throw new error_utils_1.CustomError('Gift card product not found', 404);
    }
    const update = {};
    if (body.title !== undefined)
        update.title = body.title.trim();
    if (body.description !== undefined)
        update.description = body.description.trim();
    if (body.imageUrls !== undefined)
        update.imageUrls = body.imageUrls;
    if (body.denominations !== undefined)
        update.denominations = normalizeDenominations(body.denominations);
    if (body.storeCurrencyCode !== undefined)
        update.storeCurrencyCode = body.storeCurrencyCode.trim();
    if (body.redemptionScope !== undefined)
        update.redemptionScope = normalizeRedemptionScope(body.redemptionScope);
    if (body.status !== undefined)
        update.status = body.status === 'active' ? 'active' : 'draft';
    if (body.pageTitle !== undefined)
        update.pageTitle = body.pageTitle.trim();
    if (body.metaDescription !== undefined)
        update.metaDescription = body.metaDescription.trim();
    if (body.urlHandle !== undefined)
        update.urlHandle = body.urlHandle.trim();
    if (body.productType !== undefined) {
        update.productType =
            body.productType && mongoose_1.default.isValidObjectId(body.productType) ? body.productType : null;
    }
    if (body.vendor !== undefined) {
        update.vendor = body.vendor && mongoose_1.default.isValidObjectId(body.vendor) ? body.vendor : null;
    }
    if (body.tagIds !== undefined) {
        update.tagIds = Array.isArray(body.tagIds)
            ? body.tagIds.filter((tagId) => mongoose_1.default.isValidObjectId(tagId))
            : [];
    }
    if (body.themeTemplate !== undefined)
        update.themeTemplate = body.themeTemplate.trim();
    if (body.giftCardTemplate !== undefined)
        update.giftCardTemplate = body.giftCardTemplate.trim();
    const product = await gift_card_product_model_1.GiftCardProduct.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        data: product,
        message: 'Gift card product updated successfully',
    });
});
exports.deleteGiftCardProduct = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid gift card product id', 400);
    }
    const product = await gift_card_product_model_1.GiftCardProduct.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
    if (!product) {
        throw new error_utils_1.CustomError('Gift card product not found', 404);
    }
    res.status(200).json({
        success: true,
        data: { id: product._id },
        message: 'Gift card product deleted successfully',
    });
});
