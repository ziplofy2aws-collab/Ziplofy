import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMarketIncludes {
  _id: mongoose.Types.ObjectId;
  marketId: mongoose.Types.ObjectId;
  countryId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const marketIncludesSchema = new Schema<IMarketIncludes & Document>({
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
}, { timestamps: true, versionKey: false });

// Ensure uniqueness of pair (marketId, countryId)
marketIncludesSchema.index({ marketId: 1, countryId: 1 }, { unique: true });

export const MarketIncludes: Model<IMarketIncludes & Document> = mongoose.model<IMarketIncludes & Document>('MarketIncludes', marketIncludesSchema);


