import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Country Tax Interface
export interface ICountryTax {
  _id: mongoose.Types.ObjectId;
  countryId: Types.ObjectId;
  taxRate: number;
  createdAt: Date;
  updatedAt: Date;
}

// Country Tax Schema
const countryTaxSchema = new Schema<ICountryTax & Document>(
  {
    countryId: {
      type: Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "Country ID is required"],
      index: true,
      unique: true, // One tax rate per country
    },
    taxRate: {
      type: Number,
      required: [true, "Tax rate is required"],
      min: [0, "Tax rate cannot be negative"],
      max: [100, "Tax rate cannot exceed 100%"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
countryTaxSchema.index({ countryId: 1 }, { unique: true });

// Export the CountryTax model
export const CountryTax: Model<ICountryTax & Document> = mongoose.model<ICountryTax & Document>(
  "CountryTax",
  countryTaxSchema
);

