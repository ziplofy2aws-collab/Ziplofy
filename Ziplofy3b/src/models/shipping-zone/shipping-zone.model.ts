import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingZone extends Document {
  zoneName: string;
  shippingProfileId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingZoneSchema = new Schema<IShippingZone>(
  {
    zoneName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    shippingProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingProfile',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ShippingZoneSchema.index({ shippingProfileId: 1, zoneName: 1 }, { unique: true });

export const ShippingZone: Model<IShippingZone> =
  mongoose.models.ShippingZone ||
  mongoose.model<IShippingZone>('ShippingZone', ShippingZoneSchema);

