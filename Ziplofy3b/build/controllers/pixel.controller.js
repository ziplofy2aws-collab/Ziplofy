"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPixelsByStoreId = exports.deletePixel = exports.updatePixel = exports.createPixel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const error_utils_1 = require("../utils/error.utils");
const extractPayload = (body) => {
    const payload = {};
    const keys = [
        'pixelName',
        'type',
        'status',
        'required',
        'notRequired',
        'marketing',
        'analytics',
        'preferences',
        'dataSale',
        'code',
    ];
    keys.forEach((k) => {
        if (body[k] !== undefined)
            payload[k] = body[k];
    });
    return payload;
};
exports.createPixel = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const payload = extractPayload(req.body);
    const created = await models_1.Pixel.create({ storeId, ...payload });
    return res.status(201).json({ success: true, data: created, message: 'Pixel created' });
});
exports.updatePixel = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid pixel id is required', 400);
    }
    const payload = extractPayload(req.body);
    const updated = await models_1.Pixel.findByIdAndUpdate(id, { $set: payload }, { new: true });
    if (!updated)
        throw new error_utils_1.CustomError('Pixel not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Pixel updated' });
});
exports.deletePixel = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid pixel id is required', 400);
    }
    const deleted = await models_1.Pixel.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError('Pixel not found', 404);
    return res.status(200).json({ success: true, data: deleted, message: 'Pixel deleted' });
});
exports.getPixelsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const pixels = await models_1.Pixel.find({ storeId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: pixels, message: 'Pixels fetched' });
});
