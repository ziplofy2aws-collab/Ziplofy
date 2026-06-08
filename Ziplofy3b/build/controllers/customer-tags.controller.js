"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerTagsByStoreId = exports.deleteCustomerTag = exports.createCustomerTag = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const customer_tags_model_1 = require("../models/customer-tags/customer-tags.model");
const error_utils_1 = require("../utils/error.utils");
// Create a new customer tag
exports.createCustomerTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name } = req.body;
    if (!storeId || !name) {
        throw new error_utils_1.CustomError("Store ID and tag name are required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    // Check for duplicate tag name within the same store
    const existingTag = await customer_tags_model_1.CustomerTags.findOne({
        storeId,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    if (existingTag) {
        throw new error_utils_1.CustomError("Tag with this name already exists for this store", 409);
    }
    const customerTag = new customer_tags_model_1.CustomerTags({
        storeId,
        name: name.trim(),
    });
    const savedTag = await customerTag.save();
    res.status(201).json({
        success: true,
        message: "Customer tag created successfully",
        data: savedTag,
    });
});
// Delete a customer tag by ID
exports.deleteCustomerTag = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid tag ID format", 400);
    }
    const tag = await customer_tags_model_1.CustomerTags.findByIdAndDelete(id);
    if (!tag) {
        throw new error_utils_1.CustomError("Customer tag not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Customer tag deleted successfully",
        data: {
            deletedTag: {
                id: tag._id,
                storeId: tag.storeId,
                name: tag.name,
            },
        },
    });
});
// Get customer tags by store ID
exports.getCustomerTagsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    const tags = await customer_tags_model_1.CustomerTags.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        message: "Customer tags retrieved successfully",
        data: tags,
        count: tags.length,
    });
});
