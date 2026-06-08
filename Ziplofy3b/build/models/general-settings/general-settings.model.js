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
exports.GeneralSettings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const generalSettingsSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true,
        unique: true,
    },
    backupRegion: {
        type: String,
        default: 'India',
        trim: true,
    },
    unitSystem: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric',
    },
    weightUnit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz'],
        default: 'kg',
    },
    timeZone: {
        type: String,
        default: 'Asia/Kolkata',
        trim: true,
    },
    orderIdPrefix: {
        type: String,
        default: '#',
        trim: true,
    },
    orderIdSuffix: {
        type: String,
        default: '',
        trim: true,
    },
    fulfillmentOption: {
        type: String,
        enum: ['fulfill_all', 'fulfill_gift_cards', 'dont_fulfill'],
        default: 'dont_fulfill',
    },
    notifyCustomers: {
        type: Boolean,
        default: false,
    },
    fulfillHighRiskOrders: {
        type: Boolean,
        default: false,
    },
    autoArchive: {
        type: Boolean,
        default: true,
    },
    storeName: {
        type: String,
        trim: true,
        default: undefined,
    },
    storeEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: undefined,
    },
    storePhone: {
        type: String,
        trim: true,
        default: undefined,
    },
    legalBusinessName: {
        type: String,
        trim: true,
        default: undefined,
    },
    billingCountry: {
        type: String,
        trim: true,
        default: undefined,
    },
    billingAddress: {
        type: String,
        trim: true,
        default: undefined,
    },
    billingApartment: {
        type: String,
        trim: true,
        default: undefined,
    },
    billingCity: {
        type: String,
        trim: true,
        default: undefined,
    },
    billingState: {
        type: String,
        trim: true,
        default: undefined,
    },
    billingPinCode: {
        type: String,
        trim: true,
        default: undefined,
    },
}, { timestamps: true, versionKey: false });
generalSettingsSchema.index({ storeId: 1 });
exports.GeneralSettings = mongoose_1.default.models.GeneralSettings || mongoose_1.default.model('GeneralSettings', generalSettingsSchema);
