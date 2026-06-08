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
exports.Catalog = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CatalogSchema = new mongoose_1.Schema({
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'draft'], default: 'draft', index: true },
    // 💰 Currency reference
    currencyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Currency', required: true },
    // 💸 Price adjustment settings
    priceAdjustment: { type: Number, default: 0 }, // percentage
    priceAdjustmentSide: { type: String, enum: ['increase', 'decrease'], default: 'decrease' },
    includeCompareAtPrice: { type: Boolean, default: false },
    // ⚙️ Auto product inclusion
    autoIncludeNewProducts: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });
CatalogSchema.index({ storeId: 1, title: 1 }, { unique: false });
exports.Catalog = mongoose_1.default.model('Catalog', CatalogSchema);
