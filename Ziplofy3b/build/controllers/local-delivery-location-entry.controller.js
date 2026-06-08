"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalDeliveryLocationEntriesByLocalDeliveryId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const local_delivery_location_entry_model_1 = require("../models/local-delivery-settings/local-delivery-location-entry.model");
const error_utils_1 = require("../utils/error.utils");
exports.getLocalDeliveryLocationEntriesByLocalDeliveryId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { localDeliveryId } = req.params;
    if (!localDeliveryId || !mongoose_1.default.isValidObjectId(localDeliveryId)) {
        throw new error_utils_1.CustomError('A valid localDeliveryId is required', 400);
    }
    const entries = await local_delivery_location_entry_model_1.LocalDeliveryLocationEntry.find({ localDeliveryId })
        .populate('locationId')
        .lean();
    return res.status(200).json({
        success: true,
        data: entries,
        message: 'Local delivery location entries fetched successfully',
    });
});
