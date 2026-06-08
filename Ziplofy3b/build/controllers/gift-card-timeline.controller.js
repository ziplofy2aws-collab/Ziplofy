"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTimelineEntry = exports.updateTimelineEntry = exports.getTimelineByGiftCardId = exports.createTimelineEntry = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const gift_card_timeline_model_1 = require("../models/gift-cards/gift-card-timeline.model");
const error_utils_1 = require("../utils/error.utils");
// Create timeline entry
exports.createTimelineEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { giftCardId, comment } = req.body;
    if (!giftCardId || !comment) {
        throw new error_utils_1.CustomError('giftCardId and comment are required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(giftCardId)) {
        throw new error_utils_1.CustomError('Invalid giftCardId', 400);
    }
    const timelineEntry = await gift_card_timeline_model_1.GiftCardTimelineModel.create({
        giftCardId,
        type: "comment", // Default to comment for user-created entries
        comment
    });
    res.status(201).json({
        success: true,
        data: timelineEntry,
        message: 'Timeline entry created successfully'
    });
});
// Get timeline entries by gift card id
exports.getTimelineByGiftCardId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { giftCardId } = req.params;
    if (!giftCardId) {
        throw new error_utils_1.CustomError('giftCardId is required', 400);
    }
    if (!mongoose_1.default.isValidObjectId(giftCardId)) {
        throw new error_utils_1.CustomError('Invalid giftCardId', 400);
    }
    const timelineEntries = await gift_card_timeline_model_1.GiftCardTimelineModel.find({ giftCardId })
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: timelineEntries,
        count: timelineEntries.length
    });
});
// Update timeline entry
exports.updateTimelineEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid timeline entry id', 400);
    }
    if (!comment || comment.trim() === '') {
        throw new error_utils_1.CustomError('Comment is required', 400);
    }
    const timelineEntry = await gift_card_timeline_model_1.GiftCardTimelineModel.findByIdAndUpdate(id, { comment: comment.trim() }, { new: true, runValidators: true });
    if (!timelineEntry) {
        throw new error_utils_1.CustomError('Timeline entry not found', 404);
    }
    res.status(200).json({
        success: true,
        data: timelineEntry,
        message: 'Timeline entry updated successfully'
    });
});
// Delete timeline entry
exports.deleteTimelineEntry = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid timeline entry id', 400);
    }
    const timelineEntry = await gift_card_timeline_model_1.GiftCardTimelineModel.findByIdAndDelete(id);
    if (!timelineEntry) {
        throw new error_utils_1.CustomError('Timeline entry not found', 404);
    }
    res.status(200).json({
        success: true,
        data: {
            deletedTimelineEntry: {
                id: timelineEntry._id,
                type: timelineEntry.type,
                comment: timelineEntry.comment
            }
        },
        message: 'Timeline entry deleted successfully'
    });
});
