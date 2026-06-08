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
exports.BuyXGetYDiscount = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const buyXGetYSchema = new mongoose_1.Schema({
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    method: { type: String, enum: ['discount-code', 'automatic'], required: true, index: true },
    discountCode: { type: String, trim: true },
    title: { type: String, trim: true },
    allowDiscountOnChannels: { type: Boolean, default: false },
    customerBuys: { type: String, enum: ['minimum-quantity', 'minimum-amount'], required: true },
    quantity: { type: Number, min: 0 },
    amount: { type: Number, min: 0 },
    anyItemsFrom: { type: String, enum: ['specific-products', 'specific-collections'], required: true },
    customerGetsQuantity: { type: Number, required: true, min: 1 },
    customerGetsAnyItemsFrom: { type: String, enum: ['specific-products', 'specific-collections'], required: true },
    discountedValue: { type: String, enum: ['free', 'amount', 'percentage'], required: true },
    discountedAmount: { type: Number, min: 0 },
    discountedPercentage: { type: Number, min: 0, max: 100 },
    setMaxUsersPerOrder: { type: Boolean, default: false },
    maxUsersPerOrder: { type: Number, min: 1 },
    eligibility: { type: String, enum: ['all-customers', 'specific-customer-segments', 'specific-customers'], required: true },
    applyOnPOSPro: { type: Boolean, default: false },
    limitTotalUses: { type: Boolean, default: false },
    totalUsesLimit: { type: Number, min: 1 },
    limitOneUsePerCustomer: { type: Boolean, default: false },
    productDiscounts: { type: Boolean, default: false },
    orderDiscounts: { type: Boolean, default: false },
    shippingDiscounts: { type: Boolean, default: false },
    startDate: { type: String },
    startTime: { type: String },
    setEndDate: { type: Boolean, default: false },
    endDate: { type: String },
    endTime: { type: String },
    status: { type: String, enum: ['active', 'draft'], default: 'active', index: true },
}, { timestamps: true, versionKey: false });
// Guardrails for conditional requirements
buyXGetYSchema.pre('validate', function (next) {
    const doc = this;
    if (doc.method === 'discount-code' && !doc.discountCode) {
        return next(new Error('discountCode is required when method is discount-code'));
    }
    if (doc.method === 'automatic' && !doc.title) {
        return next(new Error('title is required when method is automatic'));
    }
    if (doc.customerBuys === 'minimum-quantity' && (doc.quantity === undefined || doc.quantity === null)) {
        return next(new Error('quantity is required when customerBuys is minimum-quantity'));
    }
    if (doc.customerBuys === 'minimum-amount' && (doc.amount === undefined || doc.amount === null)) {
        return next(new Error('amount is required when customerBuys is minimum-amount'));
    }
    if (doc.discountedValue === 'amount' && (doc.discountedAmount === undefined || doc.discountedAmount === null)) {
        return next(new Error('discountedAmount is required when discountedValue is amount'));
    }
    if (doc.discountedValue === 'percentage' && (doc.discountedPercentage === undefined || doc.discountedPercentage === null)) {
        return next(new Error('discountedPercentage is required when discountedValue is percentage'));
    }
    next();
});
buyXGetYSchema.index({ storeId: 1, status: 1, createdAt: -1 });
exports.BuyXGetYDiscount = mongoose_1.default.models.BuyXGetYDiscount || mongoose_1.default.model('BuyXGetYDiscount', buyXGetYSchema);
