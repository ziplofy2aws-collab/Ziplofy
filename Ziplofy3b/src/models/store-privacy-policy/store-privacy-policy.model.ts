import mongoose, { Document, Schema } from 'mongoose';

export interface IStorePrivacyPolicy extends Document {
  storeId: Schema.Types.ObjectId;
  privacyPolicy: string;
  createdAt: Date;
  updatedAt: Date;
}

const StorePrivacyPolicySchema = new Schema<IStorePrivacyPolicy>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
      unique: true,
    },
    privacyPolicy: {
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

export const StorePrivacyPolicy = mongoose.model<IStorePrivacyPolicy>('StorePrivacyPolicy', StorePrivacyPolicySchema);
