import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Product Override Entry Interface
export interface IProductOverrideEntry {
  _id: mongoose.Types.ObjectId;
  productOverrideId: Types.ObjectId; // Reference to ProductOverride
  stateId?: Types.ObjectId | null; // null for country-level (federal) tax rate
  taxRate: number; // Percentage (e.g., 9, 18)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product Override Entry Schema
const productOverrideEntrySchema = new Schema<IProductOverrideEntry & Document>(
  {
    productOverrideId: {
      type: Schema.Types.ObjectId,
      ref: "ProductOverride",
      required: [true, "Product Override ID is required"],
      index: true,
    },
    stateId: {
      type: Schema.Types.ObjectId,
      ref: "State",
      default: null,
      index: true,
    },
    taxRate: {
      type: Number,
      required: [true, "Tax rate is required"],
      min: [0, "Tax rate cannot be negative"],
      max: [100, "Tax rate cannot exceed 100%"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
productOverrideEntrySchema.index({ productOverrideId: 1 });
productOverrideEntrySchema.index({ productOverrideId: 1, stateId: 1 });
productOverrideEntrySchema.index({ stateId: 1 });
productOverrideEntrySchema.index({ isActive: 1 });

// Ensure unique product override entry per productOverride-state combination
productOverrideEntrySchema.index(
  { productOverrideId: 1, stateId: 1 },
  { unique: true, sparse: true }
);

// Export the ProductOverrideEntry model
export const ProductOverrideEntry: Model<IProductOverrideEntry & Document> = mongoose.model<IProductOverrideEntry & Document>(
  "ProductOverrideEntry",
  productOverrideEntrySchema
);

