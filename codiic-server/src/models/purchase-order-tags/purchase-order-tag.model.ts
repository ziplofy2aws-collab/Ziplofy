import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for purchase order tag
export interface IPurchaseOrderTag extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const purchaseOrderTagSchema = new Schema<IPurchaseOrderTag>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Index for efficient queries
purchaseOrderTagSchema.index({ storeId: 1, name: 1 }, { unique: true });

// Model export
export const PurchaseOrderTag: Model<IPurchaseOrderTag> = mongoose.model<IPurchaseOrderTag>(
  "PurchaseOrderTag",
  purchaseOrderTagSchema
);
