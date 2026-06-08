"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerSegmentEntriesBySegment = exports.deleteCustomerSegmentEntry = exports.createCustomerSegmentEntry = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const createCustomerSegmentEntry = async (req, res) => {
    try {
        const { segmentId, customerId } = req.body;
        if (!segmentId)
            return res.status(400).json({ success: false, message: 'segmentId is required' });
        if (!customerId)
            return res.status(400).json({ success: false, message: 'customerId is required' });
        const created = await models_1.CustomerSegmentEntry.create({
            segmentId: new mongoose_1.default.Types.ObjectId(segmentId),
            customerId: new mongoose_1.default.Types.ObjectId(customerId),
        });
        // populate customer on response
        const populated = await created.populate('customerId');
        return res.status(201).json({ success: true, data: populated });
    }
    catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ success: false, message: 'Customer already in this segment' });
        }
        return res.status(500).json({ success: false, message: err?.message || 'Failed to add customer to segment' });
    }
};
exports.createCustomerSegmentEntry = createCustomerSegmentEntry;
const deleteCustomerSegmentEntry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ success: false, message: 'id is required' });
        const deleted = await models_1.CustomerSegmentEntry.findByIdAndDelete(new mongoose_1.default.Types.ObjectId(id));
        if (!deleted)
            return res.status(404).json({ success: false, message: 'Customer segment entry not found' });
        return res.status(200).json({ success: true, data: deleted });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err?.message || 'Failed to delete customer from segment' });
    }
};
exports.deleteCustomerSegmentEntry = deleteCustomerSegmentEntry;
const getCustomerSegmentEntriesBySegment = async (req, res) => {
    try {
        const { segmentId } = req.params;
        if (!segmentId)
            return res.status(400).json({ success: false, message: 'segmentId is required' });
        const entries = await models_1.CustomerSegmentEntry.find({ segmentId: new mongoose_1.default.Types.ObjectId(segmentId) })
            .populate('customerId')
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: entries });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err?.message || 'Failed to fetch customer segment entries' });
    }
};
exports.getCustomerSegmentEntriesBySegment = getCustomerSegmentEntriesBySegment;
