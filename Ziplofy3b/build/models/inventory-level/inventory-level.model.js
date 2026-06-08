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
exports.InventoryLevelModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const unavailableSchema = new mongoose_1.Schema({
    damaged: { type: Number, default: 0 },
    qualityControl: { type: Number, default: 0 },
    safetyStock: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
}, { _id: false });
const inventoryLevelSchema = new mongoose_1.Schema({
    variantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ProductVariant',
        required: [true, 'variantId is required'],
        index: true,
    },
    locationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'locationId is required'],
        index: true,
    },
    onHand: { type: Number, default: 0, min: 0 },
    committed: { type: Number, default: 0, min: 0 },
    unavailable: { type: unavailableSchema, default: () => ({}) },
    available: { type: Number, default: 0, min: 0 },
    incoming: { type: Number, default: 0, min: 0 },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
});
// Optional index for uniqueness
inventoryLevelSchema.index({ variantId: 1, locationId: 1 }, { unique: true });
exports.InventoryLevelModel = mongoose_1.default.model('InventoryLevel', inventoryLevelSchema);
