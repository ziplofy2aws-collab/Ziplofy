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
exports.GiftCardProduct = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const giftCardProductSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Store ID is required'],
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxLength: [200, 'Title cannot exceed 200 characters'],
        minLength: [2, 'Title must be at least 2 characters'],
    },
    description: {
        type: String,
        trim: true,
        default: '',
        maxLength: [5000, 'Description cannot exceed 5000 characters'],
    },
    imageUrls: {
        type: [String],
        default: [],
    },
    denominations: {
        type: [Number],
        required: [true, 'At least one denomination is required'],
        validate: {
            validator(value) {
                return Array.isArray(value) && value.length > 0 && value.every((amount) => amount > 0);
            },
            message: 'Denominations must include at least one positive amount',
        },
    },
    storeCurrencyCode: {
        type: String,
        trim: true,
        default: 'INR',
        maxLength: [8, 'Currency code cannot exceed 8 characters'],
    },
    redemptionScope: {
        type: String,
        enum: ['all_currencies', 'store_currency'],
        default: 'all_currencies',
    },
    status: {
        type: String,
        enum: ['active', 'draft'],
        default: 'draft',
    },
    pageTitle: {
        type: String,
        trim: true,
        default: '',
        maxLength: [70, 'Page title cannot exceed 70 characters'],
    },
    metaDescription: {
        type: String,
        trim: true,
        default: '',
        maxLength: [320, 'Meta description cannot exceed 320 characters'],
    },
    urlHandle: {
        type: String,
        trim: true,
        default: '',
        maxLength: [200, 'URL handle cannot exceed 200 characters'],
    },
    productType: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ProductType',
        default: null,
    },
    vendor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vendor',
        default: null,
    },
    tagIds: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ProductTag' }],
        default: [],
    },
    themeTemplate: {
        type: String,
        trim: true,
        default: 'default-product',
        maxLength: [100, 'Theme template cannot exceed 100 characters'],
    },
    giftCardTemplate: {
        type: String,
        trim: true,
        default: 'gift_card',
        maxLength: [100, 'Gift card template cannot exceed 100 characters'],
    },
    linkedProductId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
        index: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
giftCardProductSchema.index({ storeId: 1, isDeleted: 1, createdAt: -1 });
giftCardProductSchema.index({ storeId: 1, urlHandle: 1 }, { unique: true, partialFilterExpression: { isDeleted: false, urlHandle: { $type: 'string', $ne: '' } } });
exports.GiftCardProduct = mongoose_1.default.model('GiftCardProduct', giftCardProductSchema);
