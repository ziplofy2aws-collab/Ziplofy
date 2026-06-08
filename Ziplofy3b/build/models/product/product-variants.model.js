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
exports.ProductVariant = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const productVariantSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    optionValues: {
        type: Map,
        of: String,
        required: true,
    },
    sku: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, "SKU cannot exceed 100 characters"],
    },
    barcode: {
        type: String,
        default: null,
        trim: true,
        maxlength: [100, "Barcode cannot exceed 100 characters"],
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    compareAtPrice: {
        type: Number,
        default: null,
        min: 0,
    },
    cost: {
        type: Number,
        default: null,
        min: 0,
    },
    profit: {
        type: Number,
        default: null,
        min: 0,
    },
    marginPercent: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
    },
    unitPriceTotalAmount: { type: Number, default: undefined, min: 0 },
    unitPriceTotalAmountMetric: {
        type: String,
        enum: ['milligram', 'gram', 'kilogram', 'milliliter', 'centiliter', 'liter', 'cubic_meter', 'centimeter', 'meter', 'square_meter', 'item'],
        default: undefined,
    },
    unitPriceBaseMeasure: { type: Number, default: undefined, min: 0 },
    unitPriceBaseMeasureMetric: {
        type: String,
        enum: ['milligram', 'gram', 'kilogram', 'milliliter', 'centiliter', 'liter', 'cubic_meter', 'centimeter', 'meter', 'square_meter', 'item'],
        default: undefined,
    },
    chargeTax: { type: Boolean, default: true },
    weightValue: { type: Number, default: 0 },
    weightUnit: { type: String, default: "kg" },
    package: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Packaging",
        required: false,
    },
    countryOfOrigin: {
        type: String,
        default: null,
        trim: true,
        maxlength: [100, "Country of origin cannot exceed 100 characters"],
    },
    hsCode: {
        type: String,
        default: null,
        trim: true,
        maxlength: [100, 'HS code cannot exceed 100 characters'],
    },
    images: [{ type: String, trim: true }],
    outOfStockContinueSelling: {
        type: Boolean,
        default: false,
    },
    isInventoryTrackingEnabled: { type: Boolean, required: true, default: true },
    isSynthetic: { type: Boolean, required: true, default: false },
    isPhysicalProduct: { type: Boolean, required: true, default: true },
    depricated: { type: Boolean, required: true, default: false },
}, { timestamps: true });
exports.ProductVariant = mongoose_1.default.model("ProductVariant", productVariantSchema);
