import { Document, model, Schema } from 'mongoose';

export interface ICurrency extends Document {
  code: string;
  name: string;
  symbol?: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CurrencySchema = new Schema<ICurrency>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    symbol: { type: String, required: false },
    decimalPlaces: { type: Number, default: 2 },
    symbolPosition: {
      type: String,
      enum: ['before', 'after'],
      default: 'before',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Currency = model<ICurrency>('Currency', CurrencySchema);


