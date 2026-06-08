"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreBillingAddressesByStoreId = exports.deleteStoreBillingAddress = exports.updateStoreBillingAddress = exports.createStoreBillingAddress = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const store_billing_address_model_1 = require("../models/store-billing-address/store-billing-address.model");
const error_utils_1 = require("../utils/error.utils");
// Create billing address for a store
exports.createStoreBillingAddress = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const payload = req.body;
    if (!payload.storeId)
        throw new error_utils_1.CustomError("Store ID is required", 400);
    if (!mongoose_1.default.Types.ObjectId.isValid(String(payload.storeId)))
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    const created = await store_billing_address_model_1.StoreBillingAddress.create({
        storeId: payload.storeId,
        legalBusinessName: payload.legalBusinessName,
        country: payload.country,
        address: payload.address,
        apartment: payload.apartment,
        city: payload.city,
        state: payload.state,
        pinCode: payload.pinCode,
    });
    res.status(201).json({ success: true, message: "Store billing address created", data: created });
});
// Update billing address by id
exports.updateStoreBillingAddress = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id))
        throw new error_utils_1.CustomError("Invalid billing address ID", 400);
    const updated = await store_billing_address_model_1.StoreBillingAddress.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated)
        throw new error_utils_1.CustomError("Store billing address not found", 404);
    res.status(200).json({ success: true, message: "Store billing address updated", data: updated });
});
// Delete billing address by id
exports.deleteStoreBillingAddress = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id))
        throw new error_utils_1.CustomError("Invalid billing address ID", 400);
    const deleted = await store_billing_address_model_1.StoreBillingAddress.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError("Store billing address not found", 404);
    res.status(200).json({ success: true, message: "Store billing address deleted", data: { id: deleted._id } });
});
// Get billing addresses by storeId
exports.getStoreBillingAddressesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(storeId))
        throw new error_utils_1.CustomError("Invalid store ID format", 400);
    const addresses = await store_billing_address_model_1.StoreBillingAddress.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: "Store billing addresses fetched", data: addresses, count: addresses.length });
});
