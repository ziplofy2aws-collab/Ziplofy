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
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Main Product Schema
const productSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Product title is required"],
        trim: true,
        maxLength: [200, "Product title cannot exceed 200 characters"],
        minLength: [2, "Product title must be at least 2 characters"],
    },
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: [true, "Store ID is required"],
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true,
        maxLength: [5000, "Product description cannot exceed 5000 characters"],
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Product category is required"],
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Price cannot be negative"],
    },
    chargeTax: {
        type: Boolean,
        required: [true, "Charge tax flag is required"],
        default: true,
    },
    compareAtPrice: {
        type: Number,
        min: [0, "Compare at price cannot be negative"],
    },
    cost: {
        type: Number,
        required: [true, "Cost is required"],
        min: [0, "Cost cannot be negative"],
    },
    inventoryTrackingEnabled: {
        type: Boolean,
        required: [true, "Inventory tracking flag is required"],
        default: true,
    },
    sku: {
        type: String,
        required: [true, "SKU is required"],
        trim: true,
        maxLength: [100, "SKU cannot exceed 100 characters"],
    },
    barcode: {
        type: String,
        required: [true, "Barcode is required"],
        trim: true,
        maxLength: [100, "Barcode cannot exceed 100 characters"],
    },
    continueSellingWhenOutOfStock: {
        type: Boolean,
        default: false,
    },
    isPhysicalProduct: {
        type: Boolean,
        required: [true, "Physical product flag is required"],
        default: true,
    },
    // flattened shipping fields
    package: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Packaging",
    },
    productWeight: {
        type: Number,
        min: [0, "Product weight cannot be negative"],
    },
    productWeightUnit: {
        type: String,
        trim: true,
        maxLength: [20, "Weight unit cannot exceed 20 characters"],
        enum: {
            values: ['kg', 'g', 'lb', 'oz', 'ton'],
            message: 'Weight unit must be one of: kg, g, lb, oz, ton'
        },
    },
    countryOfOrigin: {
        type: String,
        trim: true,
        maxLength: [100, "Country of origin cannot exceed 100 characters"],
    },
    harmonizedSystemCode: {
        type: String,
        trim: true,
        maxLength: [20, "HS Code cannot exceed 20 characters"],
    },
    variants: [{
            optionName: {
                type: String,
                required: [true, "Option name is required"],
                trim: true,
                maxLength: [50, "Option name cannot exceed 50 characters"],
            },
            values: {
                type: [String],
                required: [true, "Option values are required"],
                validate: {
                    validator: function (v) { return Array.isArray(v) && v.length > 0; },
                    message: 'At least one option value is required'
                }
            }
        }],
    // flattened search engine listing fields
    pageTitle: {
        type: String,
        required: [true, "Page title is required"],
        trim: true,
        maxLength: [200, "Page title cannot exceed 200 characters"],
        minLength: [2, "Page title must be at least 2 characters"],
    },
    metaDescription: {
        type: String,
        required: [true, "Meta description is required"],
        trim: true,
        maxLength: [500, "Meta description cannot exceed 500 characters"],
        minLength: [10, "Meta description must be at least 10 characters"],
    },
    urlHandle: {
        type: String,
        required: [true, "URL handle is required"],
        trim: true,
        maxLength: [100, "URL handle cannot exceed 100 characters"],
        minLength: [2, "URL handle must be at least 2 characters"],
        match: [/^[a-z0-9-]+$/, "URL handle can only contain lowercase letters, numbers, and hyphens"],
    },
    // pricing analytics
    profit: {
        type: Number,
        required: [true, "Profit is required"],
        min: [0, "Profit cannot be negative"],
    },
    marginPercent: {
        type: Number,
        required: [true, "Margin percent is required"],
        min: [0, "Margin percent cannot be negative"],
        max: [100, "Margin percent cannot exceed 100"],
    },
    // unit price fields
    unitPriceTotalAmount: {
        type: Number,
        min: [0, "Unit price total amount cannot be negative"],
    },
    unitPriceTotalAmountMetric: {
        type: String,
        enum: ['milligram', 'gram', 'kilogram', 'milliliter', 'centiliter', 'liter', 'cubic_meter', 'centimeter', 'meter', 'square_meter', 'item'],
    },
    unitPriceBaseMeasure: {
        type: Number,
        min: [0, "Unit price base measure cannot be negative"],
    },
    unitPriceBaseMeasureMetric: {
        type: String,
        enum: ['milligram', 'gram', 'kilogram', 'milliliter', 'centiliter', 'liter', 'cubic_meter', 'centimeter', 'meter', 'square_meter', 'item'],
    },
    status: {
        type: String,
        required: [true, "Product status is required"],
        enum: ['active', 'draft'],
        default: 'draft',
    },
    onlineStorePublishing: {
        type: Boolean,
        required: [true, "Online store publishing flag is required"],
        default: true,
    },
    pointOfSalePublishing: {
        type: Boolean,
        required: [true, "POS publishing flag is required"],
        default: false,
    },
    // flattened product organization
    productType: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ProductType",
        required: [true, "Product type is required"],
    },
    vendor: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, "Vendor is required"],
        ref: "Vendor",
    },
    tagIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "ProductTags",
        }],
    imageUrls: {
        type: [String],
        required: [true, "At least one product image is required"],
        validate: {
            validator: function (v) { return Array.isArray(v) && v.length > 0; },
            message: 'At least one product image is required'
        }
    },
    // Soft delete flag
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
    // removed themeTemplate
}, {
    timestamps: true,
    versionKey: false
});
// Indexes for better performance
productSchema.index({ title: 1 });
productSchema.index({ storeId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ package: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ tagIds: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ updatedAt: -1 });
productSchema.index({ storeId: 1, isDeleted: 1 });
// Export the Product model
exports.Product = mongoose_1.default.model("Product", productSchema);
