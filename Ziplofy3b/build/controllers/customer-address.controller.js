"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerAddressesByCustomerId = exports.deleteCustomerAddress = exports.updateCustomerAddress = exports.createCustomerAddress = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const customer_address_model_1 = require("../models/customer/customer-address.model");
const customer_model_1 = require("../models/customer/customer.model");
const country_model_1 = require("../models/country/country.model");
const error_utils_1 = require("../utils/error.utils");
function resolveCountryId(countryId, countryIso2) {
    const idStr = typeof countryId === "string" ? countryId : countryId?.toString?.();
    if (idStr && mongoose_1.default.Types.ObjectId.isValid(idStr)) {
        return Promise.resolve(new mongoose_1.default.Types.ObjectId(idStr));
    }
    if (countryIso2 && typeof countryIso2 === "string" && countryIso2.length === 2) {
        return country_model_1.Country.findOne({ iso2: countryIso2.toUpperCase() }).then((c) => (c ? c._id : null));
    }
    return Promise.resolve(null);
}
// Create a new customer address
exports.createCustomerAddress = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { customerId, countryId, country, firstName, lastName, company, address, apartment, city, state, pinCode, phoneNumber, addressType } = req.body;
    if (!customerId) {
        throw new error_utils_1.CustomError("Customer ID is required", 400);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
        throw new error_utils_1.CustomError("Invalid customer ID format", 400);
    }
    if (!firstName || !lastName || !address || !city || !state || !pinCode || !phoneNumber) {
        throw new error_utils_1.CustomError("Missing required address fields", 400);
    }
    const resolvedCountryId = await resolveCountryId(countryId, country);
    if (!resolvedCountryId) {
        throw new error_utils_1.CustomError("Valid country ID or country ISO2 code (e.g. US, IN) is required", 400);
    }
    // Check if this is the first address for this customer
    const existingAddresses = await customer_address_model_1.CustomerAddress.countDocuments({ customerId });
    const isFirstAddress = existingAddresses === 0;
    const newAddress = await customer_address_model_1.CustomerAddress.create({
        customerId,
        countryId: resolvedCountryId,
        firstName,
        lastName,
        company,
        address,
        apartment,
        city,
        state,
        pinCode,
        phoneNumber,
        addressType,
    });
    // If this is the first address, set it as the default address
    if (isFirstAddress) {
        await customer_model_1.Customer.findByIdAndUpdate(customerId, {
            defaultAddress: newAddress._id
        });
    }
    const populated = await customer_address_model_1.CustomerAddress.findById(newAddress._id).populate("countryId", "name iso2").lean();
    res.status(201).json({
        success: true,
        message: "Customer address created successfully",
        data: populated || newAddress,
    });
});
// Update a customer address
exports.updateCustomerAddress = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid address ID format", 400);
    }
    const { country, ...rest } = payload;
    const updatePayload = { ...rest };
    if (payload.countryId !== undefined || country !== undefined) {
        const resolved = await resolveCountryId(payload.countryId, country);
        if (!resolved) {
            throw new error_utils_1.CustomError("Valid country ID or country ISO2 code (e.g. US, IN) is required", 400);
        }
        updatePayload.countryId = resolved;
    }
    const updated = await customer_address_model_1.CustomerAddress.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    if (!updated) {
        throw new error_utils_1.CustomError("Customer address not found", 404);
    }
    const populated = await customer_address_model_1.CustomerAddress.findById(updated._id).populate("countryId", "name iso2").lean();
    res.status(200).json({
        success: true,
        message: "Customer address updated successfully",
        data: populated || updated,
    });
});
// Delete a customer address
exports.deleteCustomerAddress = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid address ID format", 400);
    }
    const deleted = await customer_address_model_1.CustomerAddress.findByIdAndDelete(id);
    if (!deleted) {
        throw new error_utils_1.CustomError("Customer address not found", 404);
    }
    // Check if the deleted address was the default address
    const customer = await customer_model_1.Customer.findById(deleted.customerId);
    if (customer && customer.defaultAddress && customer.defaultAddress.toString() === id) {
        // Find another address for this customer to set as default
        const remainingAddresses = await customer_address_model_1.CustomerAddress.find({ customerId: deleted.customerId });
        if (remainingAddresses.length > 0) {
            // Set the first remaining address as the new default
            await customer_model_1.Customer.findByIdAndUpdate(deleted.customerId, {
                defaultAddress: remainingAddresses[0]._id
            });
        }
        else {
            // No remaining addresses, set defaultAddress to null
            await customer_model_1.Customer.findByIdAndUpdate(deleted.customerId, {
                defaultAddress: null
            });
        }
    }
    res.status(200).json({
        success: true,
        message: "Customer address deleted successfully",
        data: {
            deletedAddress: {
                id: deleted._id,
                customerId: deleted.customerId,
                address: deleted.address,
            },
        },
    });
});
// Get all addresses for a customer
exports.getCustomerAddressesByCustomerId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { customerId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(customerId)) {
        throw new error_utils_1.CustomError("Invalid customer ID format", 400);
    }
    const addresses = await customer_address_model_1.CustomerAddress.find({ customerId })
        .populate("countryId", "name iso2")
        .sort({ createdAt: -1 })
        .lean();
    res.status(200).json({
        success: true,
        message: "Customer addresses retrieved successfully",
        data: addresses,
        count: addresses.length,
    });
});
