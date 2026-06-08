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
exports.FinalSaleItem = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const finalSaleItemSchema = new mongoose_1.Schema({
    returnRulesId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ReturnRules', required: true, index: true },
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    productVariantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    collectionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Collections', default: null },
}, { timestamps: true, versionKey: false });
// Ensure at least one of productVariantId or collectionId is present
finalSaleItemSchema.pre('validate', function (next) {
    const doc = this;
    if (!doc.productVariantId && !doc.collectionId) {
        return next(new Error('Either productVariantId or collectionId must be provided'));
    }
    next();
});
finalSaleItemSchema.index({ returnRulesId: 1, productVariantId: 1 }, {
    unique: true,
    partialFilterExpression: { productVariantId: { $type: 'objectId' } },
});
finalSaleItemSchema.index({ returnRulesId: 1, collectionId: 1 }, {
    unique: true,
    partialFilterExpression: { collectionId: { $type: 'objectId' } },
});
exports.FinalSaleItem = mongoose_1.default.models.FinalSaleItem || mongoose_1.default.model('FinalSaleItem', finalSaleItemSchema);
