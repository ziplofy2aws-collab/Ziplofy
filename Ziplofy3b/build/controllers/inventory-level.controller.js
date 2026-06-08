"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventoryLevel = exports.getInventoryLevelsByLocation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const inventory_level_model_1 = require("../models/inventory-level/inventory-level.model");
const error_utils_1 = require("../utils/error.utils");
// Get inventory levels by location ID (all variants at a location)
exports.getInventoryLevelsByLocation = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { locationId } = req.params;
    if (!mongoose_1.default.isValidObjectId(locationId)) {
        throw new error_utils_1.CustomError('Invalid location ID', 400);
    }
    const inventoryLevels = await inventory_level_model_1.InventoryLevelModel.find({ locationId })
        .populate({
        path: 'variantId',
        select: 'sku optionValues productId images',
        match: { isInventoryTrackingEnabled: true, depricated: false },
        populate: { path: 'productId', select: 'title imageUrls' },
    })
        .lean();
    // Filter out entries where variant did not match (tracking disabled)
    const filtered = inventoryLevels.filter((lvl) => !!lvl.variantId);
    res.status(200).json({
        success: true,
        data: filtered,
        count: filtered.length,
        message: 'Inventory levels retrieved successfully'
    });
});
// Update inventory level: allow updating onHand, available, unavailable. Reject committed edits.
exports.updateInventoryLevel = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { onHand, available, unavailable } = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid inventory level ID', 400);
    }
    const update = {};
    // Require at least one updatable field
    if (onHand === undefined && available === undefined && (unavailable === undefined || typeof unavailable !== 'object')) {
        throw new error_utils_1.CustomError('No fields provided to update. Provide onHand, available, or unavailable.', 400);
    }
    if (typeof onHand === 'number')
        update.onHand = onHand;
    if (typeof available === 'number')
        update.available = available;
    if (unavailable && typeof unavailable === 'object')
        update.unavailable = unavailable;
    const updated = await inventory_level_model_1.InventoryLevelModel.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
    })
        .populate({
        path: 'variantId',
        select: 'sku optionValues productId images',
        populate: { path: 'productId', select: 'title imageUrls' },
    });
    if (!updated) {
        throw new error_utils_1.CustomError('Inventory level not found', 404);
    }
    res.status(200).json({ success: true, data: updated, message: 'Inventory level updated successfully' });
});
