import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILocalDeliverySettings extends Document {
  storeId: mongoose.Types.ObjectId;
}

const localDeliverySettingsSchema = new Schema<ILocalDeliverySettings>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

localDeliverySettingsSchema.index({ storeId: 1 }, { unique: true });

export const LocalDeliverySettings: Model<ILocalDeliverySettings> =
  mongoose.models.LocalDeliverySettings ||
  mongoose.model<ILocalDeliverySettings>('LocalDeliverySettings', localDeliverySettingsSchema);

