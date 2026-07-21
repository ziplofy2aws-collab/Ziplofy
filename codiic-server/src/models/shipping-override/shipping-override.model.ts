import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Shipping Override Interface
export interface IShippingOverride {
  _id: mongoose.Types.ObjectId;
  storeId: Types.ObjectId;
  countryId: Types.ObjectId;
  stateId?: Types.ObjectId | null; // null for country-level (federal) tax rate
  taxRate: number; // Percentage (e.g., 9, 18)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Shipping Override Schema
const shippingOverrideSchema = new Schema<IShippingOverride & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "Country ID is required"],
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
shippingOverrideSchema.index({ storeId: 1, countryId: 1 });
shippingOverrideSchema.index({ storeId: 1, countryId: 1, stateId: 1 });
shippingOverrideSchema.index({ countryId: 1, stateId: 1 });
shippingOverrideSchema.index({ isActive: 1 });

// Ensure unique shipping override per store-country-state combination
shippingOverrideSchema.index({ storeId: 1, countryId: 1, stateId: 1 }, { unique: true, sparse: true });

// Export the ShippingOverride model
export const ShippingOverride: Model<IShippingOverride & Document> = mongoose.model<IShippingOverride & Document>(
  "ShippingOverride",
  shippingOverrideSchema
);

