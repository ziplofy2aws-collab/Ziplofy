import { Document, model, Schema, Types } from 'mongoose';

export interface IMarket extends Document {
  storeId: Types.ObjectId;
  name: string;
  handle: string;
  parentMarketId?: Types.ObjectId | null;
  isDefault: boolean;
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const MarketSchema = new Schema<IMarket>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    parentMarketId: { type: Types.ObjectId, ref: 'Market', default: null },
    isDefault: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'active',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Market = model<IMarket>('Market', MarketSchema);


