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
exports.LocalDeliveryLocationZone = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const localDeliveryLocationZoneSchema = new mongoose_1.Schema({
    localDeliveryLocationEntryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'LocalDeliveryLocationEntry',
        required: true,
        index: true,
    },
    locationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Location',
        required: true,
    },
    zoneType: {
        type: String,
        enum: ['radius', 'pin-codes'],
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    radius: {
        max: { type: Number, min: 0 },
        unit: { type: String, enum: ['km', 'mi'], default: 'km' },
        includeNeighboringStates: { type: Boolean, default: false },
    },
    postalCodes: {
        type: [String],
        validate: {
            validator: function (value) {
                if (!value)
                    return true;
                return value.length <= 5000;
            },
            message: 'A maximum of 5000 postal codes can be stored per zone',
        },
    },
    minOrderPrice: { type: Number, min: 0, default: null },
    deliveryPrice: { type: Number, min: 0, default: null },
    deliveryInformation: { type: String, maxlength: 255, default: undefined },
    conditionalPricing: {
        type: [
            {
                minOrder: { type: Number, required: true, min: 0 },
                maxOrder: { type: Number, min: 0, default: null },
                deliveryPrice: { type: Number, required: true, min: 0 },
            },
        ],
        default: undefined,
    },
}, {
    timestamps: true,
    versionKey: false,
});
localDeliveryLocationZoneSchema.index({ localDeliveryLocationEntryId: 1, name: 1 }, { unique: true, partialFilterExpression: { localDeliveryLocationEntryId: { $exists: true } } });
exports.LocalDeliveryLocationZone = mongoose_1.default.models.LocalDeliveryLocationZone ||
    mongoose_1.default.model('LocalDeliveryLocationZone', localDeliveryLocationZoneSchema);
