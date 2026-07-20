import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ICatalogProductVariant extends Document {
  catalogId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  price?: number;
  compareAtPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogProductVariantSchema = new Schema<ICatalogProductVariant>(
  {
    catalogId: {
      type: Schema.Types.ObjectId,
      ref: 'Catalog',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
      index: true,
    },

    // price overrides
    price: { type: Number },
    compareAtPrice: { type: Number },
    
  },
  { timestamps: true, versionKey: false }
);

// Ensure uniqueness of variant–catalog pair
CatalogProductVariantSchema.index({ catalogId: 1, variantId: 1 }, { unique: true });

export const CatalogProductVariant: Model<ICatalogProductVariant> =
  mongoose.model<ICatalogProductVariant>('CatalogProductVariant', CatalogProductVariantSchema);


