"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCatalogProductVariant = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_utils_1 = require("../utils/error.utils");
const catalog_product_variant_model_1 = require("../models/catalog-product-variant/catalog-product-variant.model");
// PUT /catalog-product-variants/:id
exports.updateCatalogProductVariant = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const { price, compareAtPrice } = req.body;
    // Only allow editable fields
    const update = {};
    if (typeof price === 'number')
        update.price = price;
    if (typeof compareAtPrice === 'number')
        update.compareAtPrice = compareAtPrice;
    if (Object.keys(update).length === 0) {
        throw new error_utils_1.CustomError('Nothing to update', 400);
    }
    const updated = await catalog_product_variant_model_1.CatalogProductVariant.findByIdAndUpdate(id, update, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Catalog product variant not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Catalog product variant updated' });
});
