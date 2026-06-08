import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICheckoutSettingsEmailRegion extends Document {
  checkoutSettingsId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  countryId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const checkoutSettingsEmailRegionSchema = new Schema<ICheckoutSettingsEmailRegion>(
  {
    checkoutSettingsId: {
      type: Schema.Types.ObjectId,
      ref: 'CheckoutSettings',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

checkoutSettingsEmailRegionSchema.index(
  { checkoutSettingsId: 1, countryId: 1 },
  { unique: true }
);

export const CheckoutSettingsEmailRegion: Model<ICheckoutSettingsEmailRegion> =
  mongoose.models.CheckoutSettingsEmailRegion ||
  mongoose.model<ICheckoutSettingsEmailRegion>('CheckoutSettingsEmailRegion', checkoutSettingsEmailRegionSchema);
