import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Tax Rate Override Interface
export interface ITaxRateOverride {
  _id: mongoose.Types.ObjectId;
  storeId: Types.ObjectId;
  countryId: Types.ObjectId;
  stateId?: Types.ObjectId | null; // null for country-level (federal) tax rate
  taxRate: number; // Percentage (e.g., 9, 18)
  taxLabel: string; // Example: "IGST", "GST", "Sales Tax", "VAT", etc
  calculationMethod?: "added" | "instead" | "compounded" | null; // Only for state-level entries, Country-level (stateId = null) should leave this = null
  createdAt: Date;
  updatedAt: Date;
}

// Tax Rate Override Schema
const taxRateOverrideSchema = new Schema<ITaxRateOverride & Document>(
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
    taxLabel: {
      type: String,
      required: [true, "Tax label is required"],
      trim: true,
    },
    calculationMethod: {
      type: String,
      enum: ["added", "instead", "compounded", null],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
taxRateOverrideSchema.index({ storeId: 1, countryId: 1 });
taxRateOverrideSchema.index({ storeId: 1, countryId: 1, stateId: 1 });
taxRateOverrideSchema.index({ countryId: 1, stateId: 1 });

// Ensure unique tax rate override per store-country-state combination
taxRateOverrideSchema.index({ storeId: 1, countryId: 1, stateId: 1 }, { unique: true, sparse: true });

// Export the TaxRateOverride model
export const TaxRateOverride: Model<ITaxRateOverride & Document> = mongoose.model<ITaxRateOverride & Document>(
  "TaxRateOverride",
  taxRateOverrideSchema
);

