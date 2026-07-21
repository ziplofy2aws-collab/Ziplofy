import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Tax and Duties Global Settings Interface
export interface ITaxAndDutiesGlobalSettings {
  _id: mongoose.Types.ObjectId;
  storeId: Types.ObjectId;
  includeSalesTaxInProductPriceAndShippingRate: boolean;
  chargeSalesTaxOnShipping: boolean;
  chargeVATOnDigitalGoods: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tax and Duties Global Settings Schema
const taxAndDutiesGlobalSettingsSchema = new Schema<ITaxAndDutiesGlobalSettings & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
      unique: true, // One settings document per store
    },
    includeSalesTaxInProductPriceAndShippingRate: {
      type: Boolean,
      default: false,
    },
    chargeSalesTaxOnShipping: {
      type: Boolean,
      default: false,
    },
    chargeVATOnDigitalGoods: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
taxAndDutiesGlobalSettingsSchema.index({ storeId: 1 }, { unique: true });

// Export the TaxAndDutiesGlobalSettings model
export const TaxAndDutiesGlobalSettings: Model<ITaxAndDutiesGlobalSettings & Document> = mongoose.model<ITaxAndDutiesGlobalSettings & Document>(
  "TaxAndDutiesGlobalSettings",
  taxAndDutiesGlobalSettingsSchema
);

