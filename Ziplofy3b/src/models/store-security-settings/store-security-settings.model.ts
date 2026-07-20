import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStoreSecuritySettings extends Document {
  storeId: mongoose.Types.ObjectId;
  requireCode: boolean;
  securityCode: string | null;
  codeGeneratedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const storeSecuritySettingsSchema = new Schema<IStoreSecuritySettings>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'Store',
    },
    requireCode: {
      type: Boolean,
      default: false,
    },
    securityCode: {
      type: String,
      default: null,
    },
    codeGeneratedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

export const StoreSecuritySettings: Model<IStoreSecuritySettings> =
  mongoose.model<IStoreSecuritySettings>(
    'StoreSecuritySettings',
    storeSecuritySettingsSchema
  );

