import mongoose, { Document, Schema } from 'mongoose';

export interface IStoreReturnRefundPolicy extends Document {
  storeId: Schema.Types.ObjectId;
  returnRefundPolicy: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreReturnRefundPolicySchema = new Schema<IStoreReturnRefundPolicy>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
      unique: true,
    },
    returnRefundPolicy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const StoreReturnRefundPolicy = mongoose.model<IStoreReturnRefundPolicy>(
  'StoreReturnRefundPolicy',
  StoreReturnRefundPolicySchema
);


