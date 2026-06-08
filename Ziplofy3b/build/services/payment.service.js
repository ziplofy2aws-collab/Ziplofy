"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPaymentsByStoreId = findPaymentsByStoreId;
exports.createPaymentRecord = createPaymentRecord;
const mongoose_1 = __importDefault(require("mongoose"));
const payment_model_1 = require("../models/payment/payment.model");
async function findPaymentsByStoreId(storeId) {
    return payment_model_1.Payment.find({ storeId: new mongoose_1.default.Types.ObjectId(storeId) })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
}
async function createPaymentRecord(data) {
    try {
        const doc = await payment_model_1.Payment.create({
            storeId: data.storeId,
            customerId: data.customerId,
            name: data.name,
            email: data.email,
            utr: data.utr,
            referenceId: data.referenceId,
            amountPaise: data.amountPaise ?? null,
            merchantName: data.merchantName ?? null,
            orderId: data.orderId ?? null,
        });
        return {
            id: doc._id.toString(),
            referenceId: doc.referenceId,
        };
    }
    catch (e) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 11000) {
            const err = new Error('duplicate_utr');
            err.code = 'DUPLICATE_UTR';
            throw err;
        }
        throw e;
    }
}
