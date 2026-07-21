import mongoose, { Document, Model, Schema } from "mongoose";

// ----------------------------
// Enums and Types
// ----------------------------
export type PurchaseOrderStatus =
  | "draft"
  | "ordered"
  | "in_transit"
  | "partially_received"
  | "received"
  | "cancelled";

// Cost Adjustment Type
export interface ICostAdjustment {
  name: string;              // e.g. "shipping", "insurance", "discount"
  amount: number;            // adjustment amount (+ve or -ve)
  currency?: string;         // optional (defaults to supplierCurrency)
}

// ----------------------------
// Base interface for purchase order data
// ----------------------------
export interface IPurchaseOrderData {
  storeId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  destinationLocationId: mongoose.Types.ObjectId;

  referenceNumber?: string;
  noteToSupplier?: string;
  tags: mongoose.Types.ObjectId[];

  paymentTerm?: string;
  supplierCurrency?: string;

  shippingCarrier?: string;
  trackingNumber?: string;

  expectedArrivalDate?: Date;
  orderDate: Date;

  // Cost summary fields
  subtotalCost?: number;
  totalTax?: number;
  totalCost?: number;

  // Embedded adjustments
  costAdjustments?: ICostAdjustment[];

  status: PurchaseOrderStatus;
  isDeleted: boolean;
}

// ----------------------------
// Interfaces for create/update/query
// ----------------------------
export interface ICreatePurchaseOrder
  extends Omit<IPurchaseOrderData, "orderDate" | "isDeleted"> {
  orderDate?: Date;
}

export interface IUpdatePurchaseOrder
  extends Partial<
    Omit<IPurchaseOrderData, "storeId" | "createdAt" | "updatedAt">
  > {}

export interface IPurchaseOrderFilters {
  storeId?: mongoose.Types.ObjectId;
  supplierId?: mongoose.Types.ObjectId;
  status?: PurchaseOrderStatus;
  isDeleted?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

// ----------------------------
// Main Document Interface
// ----------------------------
export interface IPurchaseOrder extends IPurchaseOrderData, Document {
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------------
// Schema Definition
// ----------------------------
const costAdjustmentSchema = new Schema<ICostAdjustment>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    currency: { type: String, trim: true },
  },
  { _id: false } // prevents Mongoose from creating _id for each subdoc
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    destinationLocationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    referenceNumber: { type: String, trim: true },
    noteToSupplier: { type: String, trim: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "PurchaseOrderTag" }],

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
  },
  { timestamps: true, versionKey: false }
);

purchaseOrderSchema.index({ storeId: 1, createdAt: -1 });

// ----------------------------
// Model Export
// ----------------------------
export const PurchaseOrder: Model<IPurchaseOrder> = mongoose.model<IPurchaseOrder>(
  "PurchaseOrder",
  purchaseOrderSchema
);
