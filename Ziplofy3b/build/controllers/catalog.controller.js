"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatalogsByStoreId = exports.deleteCatalog = exports.updateCatalog = exports.createCatalog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const catalog_model_1 = require("../models/catalog/catalog.model");
const error_utils_1 = require("../utils/error.utils");
// POST /catalogs
exports.createCatalog = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, title, status, currencyId, priceAdjustment, priceAdjustmentSide, includeCompareAtPrice, autoIncludeNewProducts, } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    if (!currencyId || !mongoose_1.default.isValidObjectId(currencyId))
        throw new error_utils_1.CustomError('Valid currencyId is required', 400);
    if (!title || typeof title !== 'string' || !title.trim())
        throw new error_utils_1.CustomError('title is required', 400);
    const created = await catalog_model_1.Catalog.create({
        storeId,
        title: title.trim(),
        status: status || 'draft',
        currencyId,
        priceAdjustment: typeof priceAdjustment === 'number' ? priceAdjustment : 0,
        priceAdjustmentSide: priceAdjustmentSide || 'decrease',
        includeCompareAtPrice: Boolean(includeCompareAtPrice),
        autoIncludeNewProducts: Boolean(autoIncludeNewProducts),
    });
    return res.status(201).json({ success: true, data: created, message: 'Catalog created' });
});
// PUT /catalogs/:id
exports.updateCatalog = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const { title, status, currencyId, priceAdjustment, priceAdjustmentSide, includeCompareAtPrice, autoIncludeNewProducts, } = req.body;
    const update = {};
    if (typeof title === 'string')
        update.title = title.trim();
    if (status === 'active' || status === 'draft')
        update.status = status;
    if (currencyId && mongoose_1.default.isValidObjectId(currencyId))
        update.currencyId = currencyId;
    if (typeof priceAdjustment === 'number')
        update.priceAdjustment = priceAdjustment;
    if (priceAdjustmentSide === 'increase' || priceAdjustmentSide === 'decrease')
        update.priceAdjustmentSide = priceAdjustmentSide;
    if (typeof includeCompareAtPrice === 'boolean')
        update.includeCompareAtPrice = includeCompareAtPrice;
    if (typeof autoIncludeNewProducts === 'boolean')
        update.autoIncludeNewProducts = autoIncludeNewProducts;
    const updated = await catalog_model_1.Catalog.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Catalog not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Catalog updated' });
});
// DELETE /catalogs/:id
exports.deleteCatalog = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const deleted = await catalog_model_1.Catalog.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError('Catalog not found', 404);
    return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Catalog deleted' });
});
// GET /catalogs/store/:storeId
exports.getCatalogsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    const catalogs = await catalog_model_1.Catalog.find({ storeId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: catalogs, message: 'Catalogs fetched' });
});
