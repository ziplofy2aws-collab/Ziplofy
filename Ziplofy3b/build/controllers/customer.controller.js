"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = exports.getCustomerById = exports.searchCustomers = exports.deleteCustomer = exports.getCustomersByStoreId = exports.addCustomer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const customer_address_model_1 = require("../models/customer/customer-address.model");
const customer_model_1 = require("../models/customer/customer.model");
const error_utils_1 = require("../utils/error.utils");
exports.addCustomer = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, firstName, lastName, language, email, phoneNumber, agreedToMarketingEmails, agreedToSmsMarketing, collectTax, notes, tagIds } = req.body;
    // Validate required fields
    if (!storeId || !firstName || !lastName || !email || !phoneNumber) {
        throw new error_utils_1.CustomError("Missing required fields: storeId, firstName, lastName, email, phoneNumber are required", 400);
    }
    // Validate tagIds if provided
    if (tagIds && tagIds.length > 0) {
        for (const tagId of tagIds) {
            if (!mongoose_1.default.Types.ObjectId.isValid(tagId)) {
                throw new error_utils_1.CustomError(`Invalid tag ID format: ${tagId}`, 400);
            }
        }
    }
    // Create new customer first (without address)
    const customer = new customer_model_1.Customer({
        storeId,
        firstName,
        lastName,
        language: language || "en",
        email,
        phoneNumber,
        agreedToMarketingEmails: agreedToMarketingEmails || false,
        agreedToSmsMarketing: agreedToSmsMarketing || false,
        collectTax: collectTax || 'collect',
        notes,
        tagIds: tagIds || []
    });
    const savedCustomer = await customer.save();
    // Populate tags if tagIds are provided
    let populatedCustomer = savedCustomer;
    if (tagIds && tagIds.length > 0) {
        const populated = await customer_model_1.Customer.findById(savedCustomer._id)
            .populate('tagIds');
        if (populated) {
            populatedCustomer = populated;
        }
    }
    res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: populatedCustomer
    });
});
exports.getCustomersByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    // Validate storeId format
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    }
    // Get customers with populated tags for the specific store
    const customers = await customer_model_1.Customer.find({ storeId })
        .populate('tagIds')
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        message: "Customers retrieved successfully",
        data: customers
    });
});
exports.deleteCustomer = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    // Validate ObjectId format
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid customer ID format", 400);
    }
    // Find and delete the customer
    const customer = await customer_model_1.Customer.findByIdAndDelete(id);
    if (!customer) {
        throw new error_utils_1.CustomError("Customer not found", 404);
    }
    // Also delete all addresses for this customer
    await customer_address_model_1.CustomerAddress.deleteMany({ customerId: id });
    res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
        data: {
            deletedCustomer: {
                id: customer._id,
                name: `${customer.firstName} ${customer.lastName}`,
                email: customer.email
            }
        }
    });
});
// Search customers with fuzzy search on first name and last name
exports.searchCustomers = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { q, page = 1, limit = 10 } = req.query;
    if (!storeId)
        throw new error_utils_1.CustomError("storeId is required", 400);
    if (!q || typeof q !== 'string')
        throw new error_utils_1.CustomError("Search query 'q' is required", 400);
    const skip = (Number(page) - 1) * Number(limit);
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchCriteria = {
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        $or: [
            { firstName: { $regex: escapedQuery, $options: 'i' } },
            { lastName: { $regex: escapedQuery, $options: 'i' } },
            { email: { $regex: escapedQuery, $options: 'i' } },
            { phoneNumber: { $regex: escapedQuery, $options: 'i' } },
            {
                $expr: {
                    $regexMatch: {
                        input: { $concat: ['$firstName', ' ', '$lastName'] },
                        regex: escapedQuery,
                        options: 'i',
                    },
                },
            },
        ],
    };
    // Get customers with pagination
    const customers = await customer_model_1.Customer.find(searchCriteria)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();
    // Get total count for pagination
    const totalCustomers = await customer_model_1.Customer.countDocuments(searchCriteria);
    res.status(200).json({
        success: true,
        data: customers,
        pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalCustomers / Number(limit)),
            totalItems: totalCustomers,
            itemsPerPage: Number(limit)
        }
    });
});
exports.getCustomerById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid customer ID format", 400);
    }
    const customer = await customer_model_1.Customer.findById(id).populate('tagIds');
    if (!customer) {
        throw new error_utils_1.CustomError("Customer not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Customer retrieved successfully",
        data: customer,
    });
});
exports.updateCustomer = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid customer ID format", 400);
    }
    const existingCustomer = await customer_model_1.Customer.findById(id);
    if (!existingCustomer) {
        throw new error_utils_1.CustomError("Customer not found", 404);
    }
    const allowedFields = [
        'firstName',
        'lastName',
        'language',
        'email',
        'phoneNumber',
        'agreedToMarketingEmails',
        'agreedToSmsMarketing',
        'collectTax',
        'notes',
        'tagIds',
    ];
    const filteredUpdateData = {};
    for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
            filteredUpdateData[key] = updateData[key];
        }
    }
    if (Object.keys(filteredUpdateData).length === 0) {
        throw new error_utils_1.CustomError("No valid fields provided for update", 400);
    }
    if (filteredUpdateData.email && filteredUpdateData.email !== existingCustomer.email) {
        const emailExists = await customer_model_1.Customer.findOne({
            email: filteredUpdateData.email,
            _id: { $ne: id },
        });
        if (emailExists) {
            throw new error_utils_1.CustomError("Email already exists", 400);
        }
    }
    if (filteredUpdateData.tagIds) {
        if (!Array.isArray(filteredUpdateData.tagIds)) {
            throw new error_utils_1.CustomError("tagIds must be an array", 400);
        }
        for (const tagId of filteredUpdateData.tagIds) {
            if (!mongoose_1.default.Types.ObjectId.isValid(String(tagId))) {
                throw new error_utils_1.CustomError(`Invalid tag ID format: ${tagId}`, 400);
            }
        }
    }
    const updatedCustomer = await customer_model_1.Customer.findByIdAndUpdate(id, filteredUpdateData, {
        new: true,
        runValidators: true,
    }).populate('tagIds');
    if (!updatedCustomer) {
        throw new error_utils_1.CustomError("Customer not found", 404);
    }
    res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: updatedCustomer,
    });
});
