"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatalogMarketsByCatalogId = exports.deleteCatalogMarket = exports.createCatalogMarket = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const catalog_market_model_1 = require("../models/catalog-market/catalog-market.model");
const error_utils_1 = require("../utils/error.utils");
// POST /catalog-markets
exports.createCatalogMarket = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { catalogId, marketId } = req.body;
    if (!catalogId || !mongoose_1.default.isValidObjectId(catalogId))
        throw new error_utils_1.CustomError('Valid catalogId is required', 400);
    if (!marketId || !mongoose_1.default.isValidObjectId(marketId))
        throw new error_utils_1.CustomError('Valid marketId is required', 400);
    const created = await catalog_market_model_1.CatalogMarket.create({ catalogId, marketId });
    return res.status(201).json({ success: true, data: created, message: 'Catalog market created' });
});
// DELETE /catalog-markets/:id
exports.deleteCatalogMarket = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const deleted = await catalog_market_model_1.CatalogMarket.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError('Catalog market not found', 404);
    return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Catalog market deleted' });
});
// GET /catalog-markets/catalog/:catalogId
exports.getCatalogMarketsByCatalogId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { catalogId } = req.params;
    if (!catalogId || !mongoose_1.default.isValidObjectId(catalogId))
        throw new error_utils_1.CustomError('Valid catalogId is required', 400);
    const items = await catalog_market_model_1.CatalogMarket.find({ catalogId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: items, message: 'Catalog markets fetched' });
});
