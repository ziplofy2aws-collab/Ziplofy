import mongoose, { Document, Model, Schema } from 'mongoose';

export type PaymentProviderCategory = 'cards' | 'wallet' | 'bnpl' | 'bank' | 'test';

export interface IPaymentProvider {
  _id: mongoose.Types.ObjectId;
  key: string;
  name: string;
  description?: string;
  category: PaymentProviderCategory;
  supports3ds: boolean;
  paymentMethods: string[];
  isTest: boolean;
  isActive: boolean;
  isManual: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymentProviderSchema = new Schema<IPaymentProvider & Document>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['cards', 'wallet', 'bnpl', 'bank', 'test'],
      default: 'cards',
    },
    supports3ds: {
      type: Boolean,
      default: false,
    },
    paymentMethods: {
      type: [String],
      default: [],
    },
    isTest: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isManual: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentProviderSchema.index({ isActive: 1, sortOrder: 1 });

export const PaymentProvider: Model<IPaymentProvider & Document> =
  mongoose.model<IPaymentProvider & Document>('PaymentProvider', paymentProviderSchema);
