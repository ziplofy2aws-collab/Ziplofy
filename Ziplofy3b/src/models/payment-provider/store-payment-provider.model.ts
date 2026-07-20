import mongoose, { Document, Model, Schema } from 'mongoose';

export type StorePaymentProviderStatus = 'active' | 'inactive' | 'pending';

export interface IBankTransferDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface IUpiDetails {
  upiId: string;
}

export interface IStorePaymentProvider {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  providerKey: string;
  status: StorePaymentProviderStatus;
  activatedAt: Date | null;
  bankDetails?: IBankTransferDetails | null;
  upiDetails?: IUpiDetails | null;
  createdAt: Date;
  updatedAt: Date;
}

const storePaymentProviderSchema = new Schema<IStorePaymentProvider & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    providerKey: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    bankDetails: {
      bankName: { type: String, trim: true, default: '' },
      accountNumber: { type: String, trim: true, default: '' },
      ifscCode: { type: String, trim: true, uppercase: true, default: '' },
    },
    upiDetails: {
      upiId: { type: String, trim: true, lowercase: true, default: '' },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storePaymentProviderSchema.index({ storeId: 1, providerKey: 1 }, { unique: true });

export const StorePaymentProvider: Model<IStorePaymentProvider & Document> =
  mongoose.model<IStorePaymentProvider & Document>(
    'StorePaymentProvider',
    storePaymentProviderSchema
  );
