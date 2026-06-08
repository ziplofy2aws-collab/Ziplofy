"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerTimelineEntriesByCustomerId = exports.deleteCustomerTimeline = exports.updateCustomerTimeline = exports.createCustomerTimeline = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const customer_timeline_model_1 = require("../models/customer/customer-timeline/customer-timeline.model");
const error_utils_1 = require("../utils/error.utils");
// Create a new customer timeline entry
exports.createCustomerTimeline = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { customerId, comment } = req.body;
    // Validate required fields
    if (!customerId || !comment) {
        throw new error_utils_1.CustomError("Customer ID and comment are required", 400);
    }
    // Validate customerId format
    if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
        throw new error_utils_1.CustomError("Invalid customer ID format", 400);
    }
    // Create new timeline entry
    const timelineEntry = new customer_timeline_model_1.CustomerTimeline({
        customerId,
        comment: comment.trim()
    });
    const savedTimelineEntry = await timelineEntry.save();
    res.status(201).json({
        success: true,
        message: "Customer timeline entry created successfully",
        data: savedTimelineEntry
    });
});
// Update a customer timeline entry
exports.updateCustomerTimeline = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    // Validate timeline entry ID format
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid timeline entry ID format", 400);
    }
    // Validate comment
    if (!comment || comment.trim().length === 0) {
        throw new error_utils_1.CustomError("Comment is required", 400);
    }
    // Find and update the timeline entry
    const timelineEntry = await customer_timeline_model_1.CustomerTimeline.findByIdAndUpdate(id, { comment: comment.trim() }, { new: true, runValidators: true });
    if (!timelineEntry) {
        throw new error_utils_1.CustomError("Timeline entry not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Customer timeline entry updated successfully",
        data: timelineEntry
    });
});
// Delete a customer timeline entry
exports.deleteCustomerTimeline = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    // Validate timeline entry ID format
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid timeline entry ID format", 400);
    }
    // Find and delete the timeline entry
    const timelineEntry = await customer_timeline_model_1.CustomerTimeline.findByIdAndDelete(id);
    if (!timelineEntry) {
        throw new error_utils_1.CustomError("Timeline entry not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Customer timeline entry deleted successfully",
        data: {
            deletedTimelineEntry: {
                id: timelineEntry._id,
                customerId: timelineEntry.customerId,
                comment: timelineEntry.comment
            }
        }
    });
});
// Get customer timeline entries by customer ID
exports.getCustomerTimelineEntriesByCustomerId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { customerId } = req.params;
    // Validate customer ID format
    if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
        throw new error_utils_1.CustomError("Invalid customer ID format", 400);
    }
    // Find customer timeline entries by customer ID
    const timelineEntries = await customer_timeline_model_1.CustomerTimeline.find({ customerId });
    res.status(200).json({
        success: true,
        message: "Customer timeline entries retrieved successfully",
        data: timelineEntries,
        count: timelineEntries.length,
    });
});
