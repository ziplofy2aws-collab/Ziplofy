import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Product Override Interface
export interface IProductOverride {
  _id: mongoose.Types.ObjectId;
  storeId: Types.ObjectId;
  countryId: Types.ObjectId;
  collectionId: Types.ObjectId; // Reference to Collection - required for product overrides
  createdAt: Date;
  updatedAt: Date;
}

// Product Override Schema
const productOverrideSchema = new Schema<IProductOverride & Document>(
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
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collections",
      required: [true, "Collection ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
productOverrideSchema.index({ storeId: 1, countryId: 1 });
productOverrideSchema.index({ storeId: 1, collectionId: 1 });
productOverrideSchema.index({ countryId: 1, collectionId: 1 });
productOverrideSchema.index({ collectionId: 1 });

// Ensure unique product override per store-country-collection combination
productOverrideSchema.index(
  { storeId: 1, countryId: 1, collectionId: 1 },
  { unique: true }
);

// Export the ProductOverride model
export const ProductOverride: Model<IProductOverride & Document> = mongoose.model<IProductOverride & Document>(
  "ProductOverride",
  productOverrideSchema
);

