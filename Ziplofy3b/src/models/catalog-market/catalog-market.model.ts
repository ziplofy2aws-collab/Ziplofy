import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ICatalogMarket extends Document {
  catalogId: Types.ObjectId;
  marketId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogMarketSchema = new Schema<ICatalogMarket>(
  {
    catalogId: { type: Schema.Types.ObjectId, ref: 'Catalog', required: true, index: true },
    marketId: { type: Schema.Types.ObjectId, ref: 'Market', required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

// Ensure one unique mapping per catalog–market pair
CatalogMarketSchema.index({ catalogId: 1, marketId: 1 }, { unique: true });

export const CatalogMarket: Model<ICatalogMarket> =
  mongoose.model<ICatalogMarket>('CatalogMarket', CatalogMarketSchema);


