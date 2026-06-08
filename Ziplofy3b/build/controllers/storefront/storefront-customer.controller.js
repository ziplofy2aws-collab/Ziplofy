"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const customer_model_1 = require("../../models/customer/customer.model");
const error_utils_1 = require("../../utils/error.utils");
exports.updateCustomer = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { customerId } = req.params;
    const updateData = req.body;
    // Validate customerId
    if (!customerId || !mongoose_1.default.isValidObjectId(customerId)) {
        throw new error_utils_1.CustomError('Valid customerId is required', 400);
    }
    // Check if customer exists
    const existingCustomer = await customer_model_1.Customer.findById(customerId);
    if (!existingCustomer) {
        throw new error_utils_1.CustomError('Customer not found', 404);
    }
    // Validate allowed fields for update
    const allowedFields = [
        'firstName',
        'lastName',
        'language',
        'phoneNumber',
        'password',
        'isVerified',
        'agreedToMarketingEmails',
        'agreedToSmsMarketing',
        'collectTax',
        'notes',
        'tagIds',
        'defaultAddress'
    ];
    // Filter out any fields that are not allowed
    const filteredUpdateData = {};
    for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
            filteredUpdateData[key] = value;
        }
    }
    // If no valid fields to update
    if (Object.keys(filteredUpdateData).length === 0) {
        throw new error_utils_1.CustomError('No valid fields provided for update', 400);
    }
    // Handle email uniqueness if email is being updated
    if (filteredUpdateData.email && filteredUpdateData.email !== existingCustomer.email) {
        const emailExists = await customer_model_1.Customer.findOne({
            email: filteredUpdateData.email,
            _id: { $ne: customerId }
        });
        if (emailExists) {
            throw new error_utils_1.CustomError('Email already exists', 400);
        }
    }
    // Handle defaultAddress validation if provided
    if (filteredUpdateData.defaultAddress) {
        if (!mongoose_1.default.isValidObjectId(filteredUpdateData.defaultAddress)) {
            throw new error_utils_1.CustomError('Invalid defaultAddress ID', 400);
        }
    }
    // Handle tagIds validation if provided
    if (filteredUpdateData.tagIds) {
        if (!Array.isArray(filteredUpdateData.tagIds)) {
            throw new error_utils_1.CustomError('tagIds must be an array', 400);
        }
        // Validate each tagId
        for (const tagId of filteredUpdateData.tagIds) {
            if (!mongoose_1.default.isValidObjectId(tagId)) {
                throw new error_utils_1.CustomError('Invalid tagId in tagIds array', 400);
            }
        }
    }
    // Update customer
    const updatedCustomer = await customer_model_1.Customer.findByIdAndUpdate(customerId, filteredUpdateData, {
        new: true,
        runValidators: true,
        select: '-password' // Exclude password from response
    });
    if (!updatedCustomer) {
        throw new error_utils_1.CustomError('Customer not found', 404);
    }
    const secureCustomerInfo = {
        _id: updatedCustomer._id.toString(),
        storeId: updatedCustomer.storeId.toString(),
        firstName: updatedCustomer.firstName,
        lastName: updatedCustomer.lastName,
        language: updatedCustomer.language,
        email: updatedCustomer.email,
        phoneNumber: updatedCustomer.phoneNumber ?? '',
        isVerified: updatedCustomer.isVerified ?? false,
        agreedToMarketingEmails: updatedCustomer.agreedToMarketingEmails ?? false,
        agreedToSmsMarketing: updatedCustomer.agreedToSmsMarketing ?? false,
        collectTax: updatedCustomer.collectTax,
        tagIds: updatedCustomer.tagIds ?? [],
        createdAt: updatedCustomer.createdAt,
        updatedAt: updatedCustomer.updatedAt,
        defaultAddress: updatedCustomer.defaultAddress?.toString() ?? '',
    };
    res.status(200).json({ success: true, data: secureCustomerInfo, message: 'Customer updated successfully' });
});
