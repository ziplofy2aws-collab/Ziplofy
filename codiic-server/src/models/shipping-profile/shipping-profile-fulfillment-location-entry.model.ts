import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingProfileFulfillmentLocationEntry extends Document {
  shippingProfileId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  createNewRates: boolean;
  removeRates: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingProfileFulfillmentLocationEntrySchema = new Schema<IShippingProfileFulfillmentLocationEntry>(
  {
    shippingProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingProfile',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
      index: true,
    },
    createNewRates: {
      type: Boolean,
      default: false,
    },
    removeRates: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ShippingProfileFulfillmentLocationEntrySchema.index(
  { shippingProfileId: 1, storeId: 1, locationId: 1 },
  { unique: true }
);

export const ShippingProfileFulfillmentLocationEntry: Model<IShippingProfileFulfillmentLocationEntry> =
  mongoose.models.ShippingProfileFulfillmentLocationEntry ||
  mongoose.model<IShippingProfileFulfillmentLocationEntry>(
    'ShippingProfileFulfillmentLocationEntry',
    ShippingProfileFulfillmentLocationEntrySchema
  );

