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
exports.LocalDeliveryLocationEntry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const localDeliveryLocationEntrySchema = new mongoose_1.Schema({
    localDeliveryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'LocalDeliverySettings',
        required: true,
        index: true,
    },
    locationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
    },
    canLocalDeliver: {
        type: Boolean,
        default: true,
    },
    deliveryZoneType: {
        type: String,
        enum: ['radius', 'pin-codes'],
        default: 'radius',
    },
    includeNeighboringStates: {
        type: Boolean,
        default: false,
    },
    radiusUnit: {
        type: String,
        enum: ['km', 'mi'],
        default: 'km',
    },
    currencyCode: {
        type: String,
        default: 'INR',
        uppercase: true,
        trim: true,
    },
    currencySymbol: {
        type: String,
        default: '₹',
        trim: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
localDeliveryLocationEntrySchema.index({ localDeliveryId: 1, locationId: 1 }, { unique: true });
exports.LocalDeliveryLocationEntry = mongoose_1.default.models.LocalDeliveryLocationEntry ||
    mongoose_1.default.model('LocalDeliveryLocationEntry', localDeliveryLocationEntrySchema);
