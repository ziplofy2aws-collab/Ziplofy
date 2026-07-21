import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ICatalogProduct extends Document {
  catalogId: Types.ObjectId;
  productId: Types.ObjectId;
  price?: number;
  compareAtPrice?: number;
  isManuallyAdded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogProductSchema = new Schema<ICatalogProduct>(
  {
    catalogId: { type: Schema.Types.ObjectId, ref: 'Catalog', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    price: { type: Number },
    compareAtPrice: { type: Number },
    isManuallyAdded: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// Ensure a product isn't added twice to the same catalog
CatalogProductSchema.index({ catalogId: 1, productId: 1 }, { unique: true });

export const CatalogProduct: Model<ICatalogProduct> =
  mongoose.model<ICatalogProduct>('CatalogProduct', CatalogProductSchema);


