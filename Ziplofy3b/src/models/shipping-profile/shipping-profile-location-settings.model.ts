import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingProfileLocationSettings extends Document {
  shippingProfileId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  createNewRates: boolean;
  removeRates: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingProfileLocationSettingsSchema = new Schema<IShippingProfileLocationSettings>(
  {
    shippingProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingProfile',
      required: true,
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    createNewRates: {
      type: Boolean,
      required: true,
      default: false,
    },
    removeRates: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound unique index to prevent duplicate entries
ShippingProfileLocationSettingsSchema.index(
  { shippingProfileId: 1, locationId: 1, storeId: 1 },
  { unique: true }
);

export const ShippingProfileLocationSettings: Model<IShippingProfileLocationSettings> =
  mongoose.models.ShippingProfileLocationSettings ||
  mongoose.model<IShippingProfileLocationSettings>(
    'ShippingProfileLocationSettings',
    ShippingProfileLocationSettingsSchema
  );

