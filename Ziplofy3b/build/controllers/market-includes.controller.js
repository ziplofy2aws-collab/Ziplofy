"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketIncludesByMarketId = exports.deleteMarketInclude = exports.createMarketInclude = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const market_includes_model_1 = require("../models/market-includes/market-includes.model");
const error_utils_1 = require("../utils/error.utils");
// POST /market-includes
exports.createMarketInclude = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { marketId, countryId } = req.body;
    if (!marketId || !mongoose_1.default.isValidObjectId(marketId))
        throw new error_utils_1.CustomError('Valid marketId is required', 400);
    if (!countryId || !mongoose_1.default.isValidObjectId(countryId))
        throw new error_utils_1.CustomError('Valid countryId is required', 400);
    const created = await market_includes_model_1.MarketIncludes.create({ marketId, countryId });
    const populated = await market_includes_model_1.MarketIncludes.findById(created._id).populate('countryId');
    return res.status(201).json({ success: true, data: populated, message: 'Market include created' });
});
// DELETE /market-includes/:id
exports.deleteMarketInclude = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id))
        throw new error_utils_1.CustomError('Valid id is required', 400);
    const deleted = await market_includes_model_1.MarketIncludes.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError('Market include not found', 404);
    return res.status(200).json({ success: true, data: { deletedId: id }, message: 'Market include deleted' });
});
// GET /market-includes/market/:marketId
exports.getMarketIncludesByMarketId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { marketId } = req.params;
    if (!marketId || !mongoose_1.default.isValidObjectId(marketId))
        throw new error_utils_1.CustomError('Valid marketId is required', 400);
    const items = await market_includes_model_1.MarketIncludes.find({ marketId }).populate('countryId').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: items, message: 'Market includes fetched' });
});
