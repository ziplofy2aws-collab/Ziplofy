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
exports.GiftCard = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const GiftCardSchema = new mongoose_1.Schema({
    storeId: {
        type: String,
        required: [true, "Store ID is required"],
        trim: true,
    },
    code: {
        type: String,
        required: [true, "Gift card code is required"],
        unique: true,
        trim: true,
        maxLength: [50, "Gift card code cannot exceed 50 characters"],
        minLength: [3, "Gift card code must be at least 3 characters"],
    },
    initialValue: {
        type: Number,
        required: [true, "Initial value is required"],
        min: [0, "Initial value cannot be negative"],
    },
    expirationDate: {
        type: Date,
        validate: {
            validator: function (value) {
                // If expiration date is provided, it should be in the future
                return !value || value > new Date();
            },
            message: "Expiration date must be in the future"
        }
    },
    notes: {
        type: String,
        trim: true,
        maxLength: [1000, "Notes cannot exceed 1000 characters"],
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
    versionKey: false
});
// Index for better performance
GiftCardSchema.index({ storeId: 1 });
GiftCardSchema.index({ code: 1 });
GiftCardSchema.index({ expirationDate: 1 });
GiftCardSchema.index({ isActive: 1 });
GiftCardSchema.index({ createdAt: -1 });
exports.GiftCard = mongoose_1.default.model('GiftCard', GiftCardSchema);
