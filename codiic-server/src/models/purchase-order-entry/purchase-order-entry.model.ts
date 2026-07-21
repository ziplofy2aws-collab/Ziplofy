import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPurchaseOrderEntry {
  _id: mongoose.Types.ObjectId;
  purchaseOrderId: mongoose.Types.ObjectId; // Reference to the parent PO
  variantId: mongoose.Types.ObjectId;       // The product variant being ordered
  supplierSku?: string;                     // Supplier’s SKU
  quantityOrdered: number;                  // Quantity we requested
  quantityReceived: number;                 // Quantity actually received (can be less)
  cost: number;                             // Cost per unit (before tax)
  taxPercent?: number;                      // % tax applied to this line
  totalCost: number;                        // Calculated total cost for the line
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderEntrySchema = new Schema<IPurchaseOrderEntry & Document>(
  {
    purchaseOrderId: {
      type: Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
      index: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    supplierSku: {
      type: String,
      trim: true,
    },
    quantityOrdered: {
      type: Number,
      required: true,
      min: 0,
    },
    quantityReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    taxPercent: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

export const PurchaseOrderEntry: Model<IPurchaseOrderEntry & Document> =
  mongoose.model<IPurchaseOrderEntry & Document>(
    "PurchaseOrderEntry",
    purchaseOrderEntrySchema
  );
