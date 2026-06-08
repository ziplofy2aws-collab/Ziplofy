import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Tax Default Interface
export interface ITaxDefault extends Document {
  _id: mongoose.Types.ObjectId;
  countryId: Types.ObjectId; // India, US, etc
  stateId?: Types.ObjectId | null; // Null means federal-level / country-level default, Not null means per-state default
  taxLabel: string; // Example: "Federal GST", "IGST", "Sales Tax", "VAT", etc
  taxRate: number; // Example: 9 (federal GST) or 18 (IGST)
  calculationMethod?: "added" | "instead" | "compounded" | null; // Only for state-level entries, Country-level (stateId = null) should leave this = null
  createdAt: Date;
  updatedAt: Date;
}

// Tax Default Schema
const TaxDefaultSchema = new Schema<ITaxDefault>(
  {
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
    taxLabel: {
      type: String,
      required: [true, "Tax label is required"],
      trim: true,
    },
    taxRate: {
      type: Number,
      required: [true, "Tax rate is required"],
      min: [0, "Tax rate cannot be negative"],
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

// Avoid duplicate defaults per state/country
TaxDefaultSchema.index(
  { countryId: 1, stateId: 1 },
  { unique: true }
);

// Export the TaxDefault model
export const TaxDefault: Model<ITaxDefault> = mongoose.model<ITaxDefault>(
  "TaxDefault",
  TaxDefaultSchema
);

