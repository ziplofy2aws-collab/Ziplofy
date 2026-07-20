"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectStorePaymentProvider = exports.getStorefrontPaymentMethods = exports.connectStorePaymentProvider = exports.getStorePaymentProviders = exports.getPaymentProviderByKey = exports.getPaymentProviders = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const payment_provider_model_1 = require("../models/payment-provider/payment-provider.model");
const store_payment_provider_model_1 = require("../models/payment-provider/store-payment-provider.model");
const error_utils_1 = require("../utils/error.utils");
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
function validateBankTransferDetails(bankDetails) {
    const bankName = bankDetails?.bankName?.trim();
    const accountNumber = bankDetails?.accountNumber?.trim();
    const ifscCode = bankDetails?.ifscCode?.trim().toUpperCase();
    if (!bankName) {
        throw new error_utils_1.CustomError('Bank name is required', 400);
    }
    if (!accountNumber || !/^\d{9,18}$/.test(accountNumber)) {
        throw new error_utils_1.CustomError('Valid bank account number is required (9–18 digits)', 400);
    }
    if (!ifscCode || !IFSC_REGEX.test(ifscCode)) {
        throw new error_utils_1.CustomError('Valid IFSC code is required', 400);
    }
    return { bankName, accountNumber, ifscCode };
}
function validateUpiDetails(upiDetails) {
    const upiId = upiDetails?.upiId?.trim().toLowerCase();
    if (!upiId || !UPI_ID_REGEX.test(upiId)) {
        throw new error_utils_1.CustomError('Valid UPI ID is required (e.g. name@paytm)', 400);
    }
    return { upiId };
}
exports.getPaymentProviders = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { search, category, manual } = req.query;
    const filter = { isActive: true };
    if (manual === 'true') {
        filter.isManual = true;
    }
    else {
        filter.isManual = { $ne: true };
    }
    if (category && category !== 'all') {
        filter.category = category;
    }
    if (search?.trim()) {
        const term = search.trim();
        filter.$or = [
            { name: { $regex: term, $options: 'i' } },
            { key: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
        ];
    }
    const providers = await payment_provider_model_1.PaymentProvider.find(filter)
        .sort({ sortOrder: 1, name: 1 })
        .lean();
    return res.status(200).json({
        success: true,
        data: providers,
        count: providers.length,
        message: 'Payment providers fetched successfully',
    });
});
exports.getPaymentProviderByKey = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { key } = req.params;
    const provider = await payment_provider_model_1.PaymentProvider.findOne({ key, isActive: true }).lean();
    if (!provider)
        throw new error_utils_1.CustomError('Payment provider not found', 404);
    return res.status(200).json({
        success: true,
        data: provider,
        message: 'Payment provider fetched successfully',
    });
});
exports.getStorePaymentProviders = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.query;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const connections = await store_payment_provider_model_1.StorePaymentProvider.find({ storeId })
        .sort({ createdAt: -1 })
        .lean();
    const providerKeys = connections.map((c) => c.providerKey);
    const providers = providerKeys.length
        ? await payment_provider_model_1.PaymentProvider.find({ key: { $in: providerKeys } }).lean()
        : [];
    const providerMap = new Map(providers.map((p) => [p.key, p]));
    const data = connections.map((connection) => ({
        ...connection,
        provider: providerMap.get(connection.providerKey) ?? null,
    }));
    return res.status(200).json({
        success: true,
        data,
        count: data.length,
        message: 'Store payment providers fetched successfully',
    });
});
exports.connectStorePaymentProvider = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, providerKey, bankDetails, upiDetails } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    if (!providerKey?.trim()) {
        throw new error_utils_1.CustomError('providerKey is required', 400);
    }
    const provider = await payment_provider_model_1.PaymentProvider.findOne({ key: providerKey.trim(), isActive: true });
    if (!provider)
        throw new error_utils_1.CustomError('Payment provider not found', 404);
    const normalizedBankDetails = provider.key === 'bank_transfer' ? validateBankTransferDetails(bankDetails) : undefined;
    const normalizedUpiDetails = provider.key === 'upi_id' ? validateUpiDetails(upiDetails) : undefined;
    const existing = await store_payment_provider_model_1.StorePaymentProvider.findOne({ storeId, providerKey: provider.key });
    if (existing) {
        if (existing.status === 'active') {
            throw new error_utils_1.CustomError('This payment provider is already connected', 409);
        }
        existing.status = 'active';
        existing.activatedAt = new Date();
        if (normalizedBankDetails) {
            existing.bankDetails = normalizedBankDetails;
        }
        if (normalizedUpiDetails) {
            existing.upiDetails = normalizedUpiDetails;
        }
        await existing.save();
        return res.status(200).json({
            success: true,
            data: existing,
            message: 'Payment provider reactivated successfully',
        });
    }
    const connection = await store_payment_provider_model_1.StorePaymentProvider.create({
        storeId,
        providerKey: provider.key,
        status: 'active',
        activatedAt: new Date(),
        ...(normalizedBankDetails ? { bankDetails: normalizedBankDetails } : {}),
        ...(normalizedUpiDetails ? { upiDetails: normalizedUpiDetails } : {}),
    });
    return res.status(201).json({
        success: true,
        data: connection,
        message: 'Payment provider connected successfully',
    });
});
/** Public storefront: active manual payment methods configured for a store. */
exports.getStorefrontPaymentMethods = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const connections = await store_payment_provider_model_1.StorePaymentProvider.find({
        storeId: new mongoose_1.default.Types.ObjectId(storeId),
        status: 'active',
    })
        .sort({ createdAt: 1 })
        .lean();
    const providerKeys = connections.map((c) => c.providerKey);
    const providers = providerKeys.length
        ? await payment_provider_model_1.PaymentProvider.find({ key: { $in: providerKeys }, isActive: true }).lean()
        : [];
    const providerMap = new Map(providers.map((p) => [p.key, p]));
    const data = connections
        .map((connection) => {
        const provider = providerMap.get(connection.providerKey);
        if (!provider)
            return null;
        const instructions = {};
        if (connection.providerKey === 'bank_transfer' && connection.bankDetails) {
            if (connection.bankDetails.bankName) {
                instructions.bankName = connection.bankDetails.bankName;
            }
            if (connection.bankDetails.accountNumber) {
                instructions.accountNumber = connection.bankDetails.accountNumber;
            }
            if (connection.bankDetails.ifscCode) {
                instructions.ifscCode = connection.bankDetails.ifscCode;
            }
        }
        if (connection.providerKey === 'upi_id' && connection.upiDetails?.upiId) {
            instructions.upiId = connection.upiDetails.upiId;
        }
        return {
            key: connection.providerKey,
            label: provider.name,
            description: provider.description ?? undefined,
            instructions: Object.keys(instructions).length > 0 ? instructions : undefined,
            sortOrder: provider.sortOrder ?? 999,
        };
    })
        .filter((row) => row !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ sortOrder: _sortOrder, ...row }) => row);
    return res.status(200).json({
        success: true,
        data,
        count: data.length,
        message: 'Storefront payment methods fetched successfully',
    });
});
exports.disconnectStorePaymentProvider = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Invalid connection id', 400);
    }
    const deleted = await store_payment_provider_model_1.StorePaymentProvider.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError('Store payment provider connection not found', 404);
    return res.status(200).json({
        success: true,
        data: { deletedId: id },
        message: 'Payment provider disconnected successfully',
    });
});
