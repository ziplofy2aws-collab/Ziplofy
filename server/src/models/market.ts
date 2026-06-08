import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMarket {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  handle: string;
  parentMarketId?: mongoose.Types.ObjectId | null;
  isDefault: boolean;
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const marketSchema = new Schema<IMarket & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, required: true, trim: true },
  handle: { type: String, required: true, unique: true, trim: true },
  parentMarketId: { type: Schema.Types.ObjectId, ref: 'Market', default: null },
  isDefault: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active', index: true },
}, { timestamps: true, versionKey: false });

// Optional helpful indexes
marketSchema.index({ storeId: 1, name: 1 }, { unique: false });

export const Market: Model<IMarket & Document> = mongoose.model<IMarket & Document>('Market', marketSchema);


