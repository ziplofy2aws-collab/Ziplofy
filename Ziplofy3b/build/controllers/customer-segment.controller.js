"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCustomerSegments = exports.updateCustomerSegmentName = exports.getCustomerSegmentsByStore = exports.createCustomerSegment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const error_utils_1 = require("../utils/error.utils");
const createCustomerSegment = async (req, res) => {
    try {
        const { storeId, name } = req.body;
        if (!storeId)
            return res.status(400).json({ success: false, message: 'storeId is required' });
        if (!name || !name.trim())
            return res.status(400).json({ success: false, message: 'name is required' });
        const doc = await models_1.CustomerSegment.create({ storeId: new mongoose_1.default.Types.ObjectId(storeId), name: name.trim() });
        return res.status(201).json({ success: true, data: doc });
    }
    catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ success: false, message: 'A segment with this name already exists for this store' });
        }
        return res.status(500).json({ success: false, message: err?.message || 'Failed to create customer segment' });
    }
};
exports.createCustomerSegment = createCustomerSegment;
const getCustomerSegmentsByStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        if (!storeId)
            return res.status(400).json({ success: false, message: 'storeId is required' });
        const list = await models_1.CustomerSegment.find({ storeId: new mongoose_1.default.Types.ObjectId(storeId) }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: list });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err?.message || 'Failed to fetch customer segments' });
    }
};
exports.getCustomerSegmentsByStore = getCustomerSegmentsByStore;
const updateCustomerSegmentName = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!id)
            return res.status(400).json({ success: false, message: 'id is required' });
        if (!name || !name.trim())
            return res.status(400).json({ success: false, message: 'name is required' });
        const updated = await models_1.CustomerSegment.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(id), { $set: { name: name.trim() } }, { new: true });
        if (!updated)
            return res.status(404).json({ success: false, message: 'Customer segment not found' });
        return res.status(200).json({ success: true, data: updated });
    }
    catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ success: false, message: 'A segment with this name already exists for this store' });
        }
        return res.status(500).json({ success: false, message: err?.message || 'Failed to update customer segment' });
    }
};
exports.updateCustomerSegmentName = updateCustomerSegmentName;
// Search customer segments with fuzzy search
exports.searchCustomerSegments = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { q, page = 1, limit = 10 } = req.query;
    if (!storeId)
        throw new error_utils_1.CustomError("storeId is required", 400);
    if (!q || typeof q !== 'string')
        throw new error_utils_1.CustomError("Search query 'q' is required", 400);
    const skip = (Number(page) - 1) * Number(limit);
    // Simple fuzzy search on customer segment names
    const searchCriteria = {
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        name: { $regex: q, $options: 'i' }
    };
    // Get customer segments with pagination
    const customerSegments = await models_1.CustomerSegment.find(searchCriteria)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();
    // Get total count for pagination
    const totalSegments = await models_1.CustomerSegment.countDocuments(searchCriteria);
    res.status(200).json({
        success: true,
        data: customerSegments,
        pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalSegments / Number(limit)),
            totalItems: totalSegments,
            itemsPerPage: Number(limit)
        }
    });
});
