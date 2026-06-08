"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmountOffOrderDiscount = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const amountOffOrderSchema = new mongoose_1.Schema({
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    method: { type: String, enum: ['discount-code', 'automatic'], required: true, index: true },
    discountCode: { type: String, trim: true },
    title: { type: String, trim: true },
    valueType: { type: String, enum: ['percentage', 'fixed-amount'], required: true },
    percentage: { type: Number, min: 0, max: 100 },
    fixedAmount: { type: Number, min: 0 },
    eligibility: { type: String, enum: ['all-customers', 'specific-customer-segments', 'specific-customers'], required: true },
    applyOnPOSPro: { type: Boolean, default: false },
    minimumPurchase: { type: String, enum: ['no-requirements', 'minimum-amount', 'minimum-quantity'], default: 'no-requirements' },
    minimumAmount: { type: Number, min: 0 },
    minimumQuantity: { type: Number, min: 0 },
    productDiscounts: { type: Boolean, default: false },
    orderDiscounts: { type: Boolean, default: false },
    shippingDiscounts: { type: Boolean, default: false },
    allowDiscountOnChannels: { type: Boolean, default: false },
    limitTotalUses: { type: Boolean, default: false },
    totalUsesLimit: { type: Number, min: 1 },
    limitOneUsePerCustomer: { type: Boolean, default: false },
    startDate: { type: String },
    startTime: { type: String },
    setEndDate: { type: Boolean, default: false },
    endDate: { type: String },
    endTime: { type: String },
    status: { type: String, enum: ['active', 'draft'], default: 'active', index: true },
}, { timestamps: true, versionKey: false });
// Guard validations
amountOffOrderSchema.pre('validate', function (next) {
    const doc = this;
    if (doc.method === 'discount-code' && !doc.discountCode) {
        return next(new Error('discountCode is required when method is discount-code'));
    }
    if (doc.method === 'automatic' && !doc.title) {
        return next(new Error('title is required when method is automatic'));
    }
    if (doc.valueType === 'percentage' && (doc.percentage === undefined || doc.percentage === null)) {
        return next(new Error('percentage is required when valueType is percentage'));
    }
    if (doc.valueType === 'fixed-amount' && (doc.fixedAmount === undefined || doc.fixedAmount === null)) {
        return next(new Error('fixedAmount is required when valueType is fixed-amount'));
    }
    if (doc.minimumPurchase === 'minimum-amount' && (doc.minimumAmount === undefined || doc.minimumAmount === null)) {
        return next(new Error('minimumAmount is required when minimumPurchase is minimum-amount'));
    }
    if (doc.minimumPurchase === 'minimum-quantity' && (doc.minimumQuantity === undefined || doc.minimumQuantity === null)) {
        return next(new Error('minimumQuantity is required when minimumPurchase is minimum-quantity'));
    }
    next();
});
amountOffOrderSchema.index({ storeId: 1, status: 1, createdAt: -1 });
exports.AmountOffOrderDiscount = mongoose_1.default.models.AmountOffOrderDiscount || mongoose_1.default.model('AmountOffOrderDiscount', amountOffOrderSchema);
