import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketIncludes extends Document {
  marketId: Schema.Types.ObjectId;
  countryId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MarketIncludesSchema = new Schema<IMarketIncludes>(
  {
    marketId: {
      type: Schema.Types.ObjectId,
      ref: 'Market',
      required: true,
      index: true,
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Ensure uniqueness of pair (marketId, countryId)
MarketIncludesSchema.index({ marketId: 1, countryId: 1 }, { unique: true });

export const MarketIncludes = mongoose.model<IMarketIncludes>('MarketIncludes', MarketIncludesSchema);


