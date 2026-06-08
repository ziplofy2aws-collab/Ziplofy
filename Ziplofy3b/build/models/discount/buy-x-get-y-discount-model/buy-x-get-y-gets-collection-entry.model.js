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
exports.BuyXGetYGetsCollectionEntry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const buyXGetYGetsCollectionEntrySchema = new mongoose_1.Schema({
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    discountId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BuyXGetYDiscount', required: true, index: true },
    collectionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Collections', required: true, index: true },
    // At a discounted value
    discountedValue: { type: String, enum: ['free', 'amount', 'percentage'], required: true },
    discountedAmount: { type: Number, min: 0 },
    discountedPercentage: { type: Number, min: 0, max: 100 },
    // Maximum uses per order
    setMaxUsesPerOrder: { type: Boolean, default: false },
    maxUsesPerOrder: { type: Number, min: 1 },
}, { timestamps: true, versionKey: false });
// Validation for conditional fields
buyXGetYGetsCollectionEntrySchema.pre('validate', function (next) {
    const doc = this;
    if (doc.discountedValue === 'amount' && (doc.discountedAmount === undefined || doc.discountedAmount === null)) {
        return next(new Error('discountedAmount is required when discountedValue is amount'));
    }
    if (doc.discountedValue === 'percentage' && (doc.discountedPercentage === undefined || doc.discountedPercentage === null)) {
        return next(new Error('discountedPercentage is required when discountedValue is percentage'));
    }
    if (doc.setMaxUsesPerOrder && (doc.maxUsesPerOrder === undefined || doc.maxUsesPerOrder === null)) {
        return next(new Error('maxUsesPerOrder is required when setMaxUsesPerOrder is true'));
    }
    next();
});
buyXGetYGetsCollectionEntrySchema.index({ storeId: 1, discountId: 1 });
buyXGetYGetsCollectionEntrySchema.index({ discountId: 1, collectionId: 1 });
exports.BuyXGetYGetsCollectionEntry = mongoose_1.default.models.BuyXGetYGetsCollectionEntry ||
    mongoose_1.default.model('BuyXGetYGetsCollectionEntry', buyXGetYGetsCollectionEntrySchema);
