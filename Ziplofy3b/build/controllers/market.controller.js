"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketCountriesByStoreId = exports.getMarketsByStoreId = exports.deleteMarket = exports.updateMarket = exports.createMarket = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const market_model_1 = require("../models/market/market.model");
const country_model_1 = require("../models/country/country.model");
const market_includes_model_1 = require("../models/market-includes/market-includes.model");
const error_utils_1 = require("../utils/error.utils");
// POST /markets
exports.createMarket = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name, status } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    if (!name || typeof name !== 'string' || !name.trim())
        throw new error_utils_1.CustomError('name is required', 400);
    const created = await market_model_1.Market.create({ storeId, name: name.trim(), status: status || 'active', handle: name.trim() });
    return res.status(201).json({ success: true, data: created, message: 'Market created' });
});
// PUT /markets/:id
exports.updateMarket = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const update = {};
    if (typeof name === 'string')
        update.name = name.trim();
    if (status === 'active' || status === 'draft')
        update.status = status;
    const updated = await market_model_1.Market.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Market not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Market updated' });
});
// DELETE /markets/:id
exports.deleteMarket = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const deleted = await market_model_1.Market.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError('Market not found', 404);
    return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Market deleted' });
});
// GET /markets/store/:storeId
exports.getMarketsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    const markets = await market_model_1.Market.find({ storeId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: markets, message: 'Markets fetched' });
});
// GET /markets/store/:storeId/countries
exports.getMarketCountriesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId))
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    const markets = await market_model_1.Market.find({ storeId }).select({ _id: 1 }).lean();
    if (markets.length === 0) {
        return res.status(200).json({ success: true, data: [], message: 'No markets found for this store' });
    }
    const marketIds = markets.map((market) => market._id);
    const marketIncludes = await market_includes_model_1.MarketIncludes.find({ marketId: { $in: marketIds } })
        .select({ countryId: 1 })
        .lean();
    const countryIdSet = new Set();
    marketIncludes.forEach((include) => {
        const rawId = include.countryId;
        if (!rawId)
            return;
        const stringId = typeof rawId === 'string'
            ? rawId
            : rawId.toString?.() ?? String(rawId);
        if (mongoose_1.default.isValidObjectId(stringId)) {
            countryIdSet.add(stringId);
        }
    });
    if (countryIdSet.size === 0) {
        return res.status(200).json({ success: true, data: [], message: 'No countries found for this store' });
    }
    const countries = await country_model_1.Country.find({ _id: { $in: Array.from(countryIdSet) } })
        .select({
        name: 1,
        officialName: 1,
        iso2: 1,
        iso3: 1,
        numericCode: 1,
        region: 1,
        subRegion: 1,
        flagEmoji: 1,
    })
        .lean();
    return res.status(200).json({
        success: true,
        data: countries,
        count: countries.length,
        message: 'Store countries fetched',
    });
});
