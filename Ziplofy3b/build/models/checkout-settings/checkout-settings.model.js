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
exports.CheckoutSettings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const checkoutSettingsSchema = new mongoose_1.Schema({
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    contactMethod: {
        type: String,
        enum: ['phone_or_email', 'email'],
        default: 'phone_or_email',
    },
    orderTracking: {
        enabled: { type: Boolean, default: true },
    },
    requireSignIn: { type: Boolean, default: false },
    marketing: {
        email: {
            enabled: { type: Boolean, default: true },
            regionMode: {
                type: String,
                enum: ['ziplofy_recommended', 'custom'],
                default: 'ziplofy_recommended',
            },
        },
        sms: {
            enabled: { type: Boolean, default: false },
        },
    },
    tipping: {
        enabled: { type: Boolean, default: false },
        presets: {
            type: [Number],
            default: [10, 15, 20],
            validate: {
                validator: (value) => Array.isArray(value) && value.every((num) => num >= 0),
                message: 'Tipping presets must be non-negative numbers.',
            },
        },
        hideUntilSelected: { type: Boolean, default: false },
    },
    checkoutLanguage: { type: String, default: 'English' },
    addressCollection: {
        useShippingAsBilling: { type: Boolean, default: true },
    },
    addToCartLimit: {
        enabled: { type: Boolean, default: false },
        limit: {
            type: Number,
            min: [1, 'Add-to-cart limit must be at least 1.'],
            default: null,
        },
        useRecommended: { type: Boolean, default: true },
    },
}, {
    timestamps: true,
    versionKey: false,
});
checkoutSettingsSchema.index({ storeId: 1 }, { unique: true });
exports.CheckoutSettings = mongoose_1.default.models.CheckoutSettings || mongoose_1.default.model('CheckoutSettings', checkoutSettingsSchema);
