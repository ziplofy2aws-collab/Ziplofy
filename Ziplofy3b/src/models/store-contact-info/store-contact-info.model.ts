import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreContactInfo extends Document {
  storeId: mongoose.Types.ObjectId;
  contactInfo: string; // raw markdown or paragraph text
}

const storeContactInfoSchema = new Schema<IStoreContactInfo>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true, unique: true },
    contactInfo: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false }
);

storeContactInfoSchema.index({ storeId: 1 });

export const StoreContactInfo: Model<IStoreContactInfo> =
  mongoose.models.StoreContactInfo || mongoose.model<IStoreContactInfo>('StoreContactInfo', storeContactInfoSchema);


