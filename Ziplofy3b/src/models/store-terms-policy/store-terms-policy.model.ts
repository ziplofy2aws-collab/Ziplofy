import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreTermsPolicy extends Document {
  storeId: mongoose.Types.ObjectId;
  termsPolicy: string;
}

const storeTermsPolicySchema = new Schema<IStoreTermsPolicy>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true, unique: true },
    termsPolicy: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false }
);

storeTermsPolicySchema.index({ storeId: 1 });

export const StoreTermsPolicy: Model<IStoreTermsPolicy> =
  mongoose.models.StoreTermsPolicy || mongoose.model<IStoreTermsPolicy>('StoreTermsPolicy', storeTermsPolicySchema);


