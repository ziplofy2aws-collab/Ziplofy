import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreShippingPolicy extends Document {
  storeId: mongoose.Types.ObjectId;
  shippingPolicy: string;
}

const storeShippingPolicySchema = new Schema<IStoreShippingPolicy>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true, unique: true },
    shippingPolicy: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false }
);

storeShippingPolicySchema.index({ storeId: 1 });

export const StoreShippingPolicy: Model<IStoreShippingPolicy> =
  mongoose.models.StoreShippingPolicy || mongoose.model<IStoreShippingPolicy>('StoreShippingPolicy', storeShippingPolicySchema);


