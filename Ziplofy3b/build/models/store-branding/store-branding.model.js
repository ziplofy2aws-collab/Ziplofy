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
exports.StoreBranding = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const storeBrandingSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true,
        unique: true
    },
    // Logos
    defaultLogoUrl: {
        type: String,
        trim: true,
        default: undefined
    },
    squareLogoUrl: {
        type: String,
        trim: true,
        default: undefined
    },
    // Colors
    primaryColor: {
        type: String,
        trim: true,
        match: /^#[0-9A-Fa-f]{6}$/, // Hex color validation
        default: undefined
    },
    contrastColor: {
        type: String,
        trim: true,
        match: /^#[0-9A-Fa-f]{6}$/, // Hex color validation
        default: undefined
    },
    secondaryColors: {
        type: [String],
        validate: {
            validator: function (v) {
                // Max 2 secondary colors and each must be valid hex color
                if (!v)
                    return true;
                if (v.length > 2)
                    return false;
                return v.every(color => /^#[0-9A-Fa-f]{6}$/.test(color));
            },
            message: 'Maximum 2 secondary colors allowed, and each must be a valid hex color code'
        },
        default: undefined
    },
    secondaryContrastColor: {
        type: String,
        trim: true,
        match: /^#[0-9A-Fa-f]{6}$/, // Hex color validation
        default: undefined
    },
    // Images
    coverImageUrl: {
        type: String,
        trim: true,
        default: undefined
    },
    // Text
    slogan: {
        type: String,
        trim: true,
        maxlength: [80, 'Slogan cannot exceed 80 characters'],
        default: undefined
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: [150, 'Short description cannot exceed 150 characters'],
        default: undefined
    },
    // Social Links
    socialLinks: {
        type: mongoose_1.Schema.Types.Mixed,
        default: undefined
    },
}, { timestamps: true, versionKey: false });
// Index for efficient queries
storeBrandingSchema.index({ storeId: 1 });
exports.StoreBranding = mongoose_1.default.models.StoreBranding || mongoose_1.default.model('StoreBranding', storeBrandingSchema);
