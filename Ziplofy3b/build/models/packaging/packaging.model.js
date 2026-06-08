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
exports.Packaging = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Main Packaging Schema
const packagingSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: [true, "Store ID is required"],
    },
    packageName: {
        type: String,
        required: [true, "Package name is required"],
        trim: true,
        maxLength: [100, "Package name cannot exceed 100 characters"],
        minLength: [2, "Package name must be at least 2 characters"],
    },
    packageType: {
        type: String,
        required: [true, "Package type is required"],
        enum: {
            values: ['box', 'envelope', 'soft_package'],
            message: 'Package type must be one of: box, envelope, soft_package'
        },
    },
    length: {
        type: Number,
        required: [true, "Length is required"],
        min: [0, "Length cannot be negative"],
    },
    width: {
        type: Number,
        required: [true, "Width is required"],
        min: [0, "Width cannot be negative"],
    },
    height: {
        type: Number,
        required: [true, "Height is required"],
        min: [0, "Height cannot be negative"],
    },
    dimensionsUnit: {
        type: String,
        required: [true, "Dimensions unit is required"],
        trim: true,
        maxLength: [20, "Dimensions unit cannot exceed 20 characters"],
        enum: {
            values: ['cm', 'in'],
            message: 'Dimensions unit must be either cm or in'
        },
    },
    weight: {
        type: Number,
        required: [true, "Weight is required"],
        min: [0, "Weight cannot be negative"],
    },
    weightUnit: {
        type: String,
        required: [true, "Weight unit is required"],
        trim: true,
        maxLength: [20, "Weight unit cannot exceed 20 characters"],
        enum: {
            values: ['g', 'kg', 'oz', 'lb'],
            message: 'Weight unit must be one of: g, kg, oz, lb'
        },
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false
});
// Indexes for better performance
packagingSchema.index({ storeId: 1 });
packagingSchema.index({ storeId: 1, packageName: 1 }); // Index for package name per store (allows duplicate names)
packagingSchema.index({ storeId: 1, isDefault: 1 }); // For finding default packages
packagingSchema.index({ packageType: 1 }); // For filtering by package type
packagingSchema.index({ dimensionsUnit: 1 });
packagingSchema.index({ weightUnit: 1 });
packagingSchema.index({ createdAt: -1 });
packagingSchema.index({ updatedAt: -1 });
// Text search index for searching packaging
packagingSchema.index({
    packageName: 'text'
});
// Export the Packaging model
exports.Packaging = mongoose_1.default.model("Packaging", packagingSchema);
