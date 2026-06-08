"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransferTimeline = exports.updateTransferTimeline = exports.getTransferTimelineByTransferId = exports.createTransferTimeline = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transfer_timeline_model_1 = require("../models/transfer-timeline/transfer-timeline.model");
const error_utils_1 = require("../utils/error.utils");
// POST /transfer-timelines
exports.createTransferTimeline = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { transferId, comment } = req.body;
    if (!transferId || !mongoose_1.default.isValidObjectId(transferId)) {
        throw new error_utils_1.CustomError('Valid transferId is required', 400);
    }
    if (!comment || typeof comment !== 'string') {
        throw new error_utils_1.CustomError('comment is required', 400);
    }
    const doc = await transfer_timeline_model_1.TransferTimelineModel.create({ transferId: new mongoose_1.default.Types.ObjectId(transferId), type: "comment", comment });
    return res.status(201).json({ success: true, data: doc, message: 'Transfer timeline entry created' });
});
// GET /transfer-timelines/transfer/:transferId
exports.getTransferTimelineByTransferId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { transferId } = req.params;
    if (!transferId || !mongoose_1.default.isValidObjectId(transferId)) {
        throw new error_utils_1.CustomError('Valid transferId is required', 400);
    }
    const list = await transfer_timeline_model_1.TransferTimelineModel.find({ transferId: new mongoose_1.default.Types.ObjectId(transferId) }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
});
// PUT /transfer-timelines/:id
exports.updateTransferTimeline = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid id is required', 400);
    }
    const { comment } = req.body;
    const update = {};
    if (comment !== undefined)
        update.comment = comment;
    const updated = await transfer_timeline_model_1.TransferTimelineModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated)
        throw new error_utils_1.CustomError('Transfer timeline entry not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Transfer timeline entry updated' });
});
// DELETE /transfer-timelines/:id
exports.deleteTransferTimeline = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid id is required', 400);
    }
    const deleted = await transfer_timeline_model_1.TransferTimelineModel.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError('Transfer timeline entry not found', 404);
    return res.status(200).json({ success: true, message: 'Transfer timeline entry deleted' });
});
