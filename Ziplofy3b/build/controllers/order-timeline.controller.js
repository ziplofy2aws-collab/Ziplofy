"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderTimelineEntry = exports.updateOrderTimelineEntry = exports.getOrderTimelineByOrderId = exports.createOrderTimelineEntry = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const order_timeline_model_1 = require("../models/order/order-timeline.model");
const error_utils_1 = require("../utils/error.utils");
exports.createOrderTimelineEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { orderId, comment, type } = req.body;
    if (!orderId || !comment?.trim()) {
        throw new error_utils_1.CustomError('orderId and comment are required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(orderId)) {
        throw new error_utils_1.CustomError('Invalid orderId', 400);
    }
    const order = await models_1.Order.findById(orderId).select('_id').lean();
    if (!order) {
        throw new error_utils_1.CustomError('Order not found', 404);
    }
    const resolvedType = type === 'event' ? 'event' : 'comment';
    const timelineEntry = await order_timeline_model_1.OrderTimelineModel.create({
        orderId,
        type: resolvedType,
        comment: comment.trim(),
    });
    res.status(201).json({
        success: true,
        data: timelineEntry,
        message: 'Order timeline entry created successfully',
    });
});
exports.getOrderTimelineByOrderId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) {
        throw new error_utils_1.CustomError('orderId is required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(orderId)) {
        throw new error_utils_1.CustomError('Invalid orderId', 400);
    }
    const order = await models_1.Order.findById(orderId).select('_id').lean();
    if (!order) {
        throw new error_utils_1.CustomError('Order not found', 404);
    }
    const timelineEntries = await order_timeline_model_1.OrderTimelineModel.find({ orderId }).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: timelineEntries,
        count: timelineEntries.length,
    });
});
exports.updateOrderTimelineEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid timeline entry id', 400);
    }
    if (!comment?.trim()) {
        throw new error_utils_1.CustomError('Comment is required', 400);
    }
    const timelineEntry = await order_timeline_model_1.OrderTimelineModel.findByIdAndUpdate(id, { comment: comment.trim() }, { new: true, runValidators: true });
    if (!timelineEntry) {
        throw new error_utils_1.CustomError('Order timeline entry not found', 404);
    }
    res.status(200).json({
        success: true,
        data: timelineEntry,
        message: 'Order timeline entry updated successfully',
    });
});
exports.deleteOrderTimelineEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid timeline entry id', 400);
    }
    const timelineEntry = await order_timeline_model_1.OrderTimelineModel.findByIdAndDelete(id);
    if (!timelineEntry) {
        throw new error_utils_1.CustomError('Order timeline entry not found', 404);
    }
    res.status(200).json({
        success: true,
        data: {
            deletedTimelineEntry: {
                id: timelineEntry._id,
                orderId: timelineEntry.orderId,
                type: timelineEntry.type,
                comment: timelineEntry.comment,
            },
        },
        message: 'Order timeline entry deleted successfully',
    });
});
