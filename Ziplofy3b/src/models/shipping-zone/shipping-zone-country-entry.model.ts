import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingZoneCountryEntry extends Document {
  shippingZoneId: mongoose.Types.ObjectId;
  countryId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingZoneCountryEntrySchema = new Schema<IShippingZoneCountryEntry>(
  {
    shippingZoneId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingZone',
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

ShippingZoneCountryEntrySchema.index(
  { shippingZoneId: 1, countryId: 1 },
  { unique: true }
);

export const ShippingZoneCountryEntry: Model<IShippingZoneCountryEntry> =
  mongoose.models.ShippingZoneCountryEntry ||
  mongoose.model<IShippingZoneCountryEntry>('ShippingZoneCountryEntry', ShippingZoneCountryEntrySchema);

