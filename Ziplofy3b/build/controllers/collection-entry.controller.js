"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionEntriesByCollectionId = exports.deleteCollectionEntry = exports.createCollectionEntry = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const collection_entry_model_1 = require("../models/collection-entry/collection-entry.model");
const error_utils_1 = require("../utils/error.utils");
exports.createCollectionEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { collectionId, productId, position } = req.body;
    if (!collectionId || !productId) {
        throw new error_utils_1.CustomError('collectionId and productId are required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(collectionId) || !mongoose_1.default.isValidObjectId(productId)) {
        throw new error_utils_1.CustomError('Invalid collectionId or productId', 400);
    }
    let resolvedPosition = typeof position === 'number' && Number.isFinite(position) && position >= 0
        ? Math.floor(position)
        : null;
    if (resolvedPosition === null) {
        const last = await collection_entry_model_1.CollectionEntry.findOne({ collectionId }).sort({ position: -1 }).select({ position: 1 }).lean();
        resolvedPosition = (last?.position || 0) + 1;
    }
    const entry = await collection_entry_model_1.CollectionEntry.create({ collectionId, productId, position: resolvedPosition });
    // Populate the product data to match product controller response format
    const populatedEntry = await collection_entry_model_1.CollectionEntry.findById(entry._id)
        .populate({
        path: 'productId',
        populate: [
            { path: 'category' },
            { path: 'package', model: 'Packaging' },
            { path: 'tagIds', model: 'ProductTags' },
            { path: 'vendor', model: 'Vendor' }
        ]
    });
    res.status(201).json({
        success: true,
        data: populatedEntry,
        message: 'Collection entry created successfully'
    });
});
exports.deleteCollectionEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid id is required', 400);
    }
    const deleted = await collection_entry_model_1.CollectionEntry.findByIdAndDelete(id);
    if (!deleted) {
        throw new error_utils_1.CustomError('Collection entry not found', 404);
    }
    res.status(200).json({ success: true, data: { deletedId: id }, message: 'Collection entry deleted successfully' });
});
exports.getCollectionEntriesByCollectionId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid collection id is required', 400);
    }
    const entries = await collection_entry_model_1.CollectionEntry.find({ collectionId: id })
        .populate({
        path: 'productId',
        populate: [
            { path: 'category' },
            { path: 'package', model: 'Packaging' },
            { path: 'tagIds', model: 'ProductTags' },
            { path: 'vendor', model: 'Vendor' }
        ]
    })
        .sort({ position: 1, createdAt: 1 });
    res.status(200).json({
        success: true,
        data: entries,
        count: entries.length,
        message: 'Collection entries fetched successfully'
    });
});
