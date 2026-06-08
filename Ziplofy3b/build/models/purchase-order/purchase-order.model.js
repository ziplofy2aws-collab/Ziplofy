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
exports.PurchaseOrder = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// ----------------------------
// Schema Definition
// ----------------------------
const costAdjustmentSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    currency: { type: String, trim: true },
}, { _id: false } // prevents Mongoose from creating _id for each subdoc
);
const purchaseOrderSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
        index: true,
    },
    supplierId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
    },
    destinationLocationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
    referenceNumber: { type: String, trim: true },
    noteToSupplier: { type: String, trim: true },
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "PurchaseOrderTag" }],
    paymentTerm: { type: String, trim: true },
    supplierCurrency: { type: String, trim: true, default: "USD" },
    shippingCarrier: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    expectedArrivalDate: { type: Date },
    orderDate: { type: Date, default: Date.now },
    subtotalCost: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    // Embedded array for cost adjustments
    costAdjustments: { type: [costAdjustmentSchema], default: [] },
    status: {
        type: String,
        enum: [
            "draft",
            "ordered",
            "in_transit",
            "partially_received",
            "received",
            "cancelled",
        ],
        default: "draft",
    },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });
purchaseOrderSchema.index({ storeId: 1, createdAt: -1 });
// ----------------------------
// Model Export
// ----------------------------
exports.PurchaseOrder = mongoose_1.default.model("PurchaseOrder", purchaseOrderSchema);
