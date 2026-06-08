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
exports.ShippingZoneRate = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ShippingZoneRateSchema = new mongoose_1.Schema({
    shippingZoneId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ShippingZone',
        required: true,
        index: true,
    },
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true,
    },
    rateType: {
        type: String,
        enum: ['flat', 'carrier'],
        required: true,
        default: 'flat',
    },
    shippingRate: {
        type: String,
        required: true,
        trim: true,
        default: 'custom',
    },
    customRateName: {
        type: String,
        required: true,
        trim: true,
    },
    customDeliveryDescription: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    conditionalPricingEnabled: {
        type: Boolean,
        required: true,
        default: false,
    },
    conditionalPricingBasis: {
        type: String,
        enum: ['weight', 'price'],
    },
    minWeight: {
        type: Number,
        min: 0,
    },
    maxWeight: {
        type: Number,
        min: 0,
    },
    minPrice: {
        type: Number,
        min: 0,
    },
    maxPrice: {
        type: Number,
        min: 0,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// Index for efficient queries by shipping zone
ShippingZoneRateSchema.index({ shippingZoneId: 1, createdAt: -1 });
// Index for efficient queries by store
ShippingZoneRateSchema.index({ storeId: 1 });
// Compound index for shipping zone and rate name uniqueness (if needed)
// ShippingZoneRateSchema.index({ shippingZoneId: 1, customRateName: 1 }, { unique: true });
exports.ShippingZoneRate = mongoose_1.default.models.ShippingZoneRate ||
    mongoose_1.default.model('ShippingZoneRate', ShippingZoneRateSchema);
