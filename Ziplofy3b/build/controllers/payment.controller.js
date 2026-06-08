"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentsByStoreId = exports.confirmPayment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const payment_service_1 = require("../services/payment.service");
const paymentConfirm_1 = require("../validation/paymentConfirm");
const error_utils_1 = require("../utils/error.utils");
const isDuplicateUtrError = (err) => typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 'DUPLICATE_UTR';
/**
 * POST /api/payments/confirm — store manual UPI confirmation (name, email, UTR) for a store + customer.
 * Response shape matches the standalone payment-gateway demo.
 */
exports.confirmPayment = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const parsed = (0, paymentConfirm_1.validatePaymentConfirmBody)(req.body);
    if (!parsed.ok || !parsed.values) {
        return res.status(400).json({
            ok: false,
            error: 'validation_failed',
            details: parsed.errors,
        });
    }
    try {
        const record = await (0, payment_service_1.createPaymentRecord)(parsed.values);
        return res.status(201).json({
            ok: true,
            id: record.id,
            referenceId: record.referenceId,
        });
    }
    catch (err) {
        if (isDuplicateUtrError(err)) {
            return res.status(409).json({
                ok: false,
                error: 'duplicate_utr',
                message: 'This UTR was already submitted for this store. Contact support if this is a mistake.',
            });
        }
        throw err;
    }
});
/**
 * GET /api/payments/store/:storeId — list all payment confirmation documents for a store (newest first).
 */
exports.getPaymentsByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const payments = await (0, payment_service_1.findPaymentsByStoreId)(storeId);
    return res.status(200).json({
        ok: true,
        data: payments,
        count: payments.length,
        message: payments.length ? 'Payments fetched' : 'No payments found for this store',
    });
});
