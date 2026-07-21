import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingZoneCountryStateEntry extends Document {
  stateId: mongoose.Types.ObjectId;
  shippingZoneCountryEntryId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingZoneCountryStateEntrySchema = new Schema<IShippingZoneCountryStateEntry>(
  {
    stateId: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      required: true,
      index: true,
    },
    shippingZoneCountryEntryId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingZoneCountryEntry',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ShippingZoneCountryStateEntrySchema.index(
  { shippingZoneCountryEntryId: 1, stateId: 1 },
  { unique: true }
);

export const ShippingZoneCountryStateEntry: Model<IShippingZoneCountryStateEntry> =
  mongoose.models.ShippingZoneCountryStateEntry ||
  mongoose.model<IShippingZoneCountryStateEntry>('ShippingZoneCountryStateEntry', ShippingZoneCountryStateEntrySchema);

