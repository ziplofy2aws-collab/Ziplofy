import mongoose, { Model, Schema, Types } from 'mongoose';

export interface ICatalog {
  _id: mongoose.Types.ObjectId;
  storeId: Types.ObjectId;
  title: string;
  status: 'active' | 'draft';

  // 💰 Currency
  currencyId: Types.ObjectId;

  // 💸 Price Adjustment
  priceAdjustment: number; // e.g. +2 = +2%
  priceAdjustmentSide: 'increase' | 'decrease';
  includeCompareAtPrice: boolean;

  // ⚙️ Settings
  autoIncludeNewProducts: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const CatalogSchema = new Schema<ICatalog>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'draft'], default: 'draft', index: true },

    // 💰 Currency reference
    currencyId: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },

    // 💸 Price adjustment settings
    priceAdjustment: { type: Number, default: 0 }, // percentage
    priceAdjustmentSide: { type: String, enum: ['increase', 'decrease'], default: 'decrease' },
    includeCompareAtPrice: { type: Boolean, default: false },

    // ⚙️ Auto product inclusion
    autoIncludeNewProducts: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

CatalogSchema.index({ storeId: 1, title: 1 }, { unique: false });

export const Catalog: Model<ICatalog> = mongoose.model<ICatalog>('Catalog', CatalogSchema);


