import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingProfileShippingZonesEntry extends Document {
  shippingProfileId: mongoose.Types.ObjectId;
  shippingZoneId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingProfileShippingZonesEntrySchema = new Schema<IShippingProfileShippingZonesEntry>(
  {
    shippingProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingProfile',
      required: true,
      index: true,
    },
    shippingZoneId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingZone',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound unique index to prevent duplicate entries
ShippingProfileShippingZonesEntrySchema.index(
  { shippingProfileId: 1, shippingZoneId: 1 },
  { unique: true }
);

export const ShippingProfileShippingZonesEntry: Model<IShippingProfileShippingZonesEntry> =
  mongoose.models.ShippingProfileShippingZonesEntry ||
  mongoose.model<IShippingProfileShippingZonesEntry>(
    'ShippingProfileShippingZonesEntry',
    ShippingProfileShippingZonesEntrySchema
  );

