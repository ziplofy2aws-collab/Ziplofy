import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingProfileProductEntry extends Document {
  shippingProfileId: mongoose.Types.ObjectId;
  productVariantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingProfileProductEntrySchema = new Schema<IShippingProfileProductEntry>(
  {
    shippingProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingProfile',
      required: true,
      index: true,
    },
    productVariantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ShippingProfileProductEntrySchema.index(
  { shippingProfileId: 1, productVariantId: 1, storeId: 1 },
  { unique: true }
);

export const ShippingProfileProductEntry: Model<IShippingProfileProductEntry> =
  mongoose.models.ShippingProfileProductEntry ||
  mongoose.model<IShippingProfileProductEntry>('ShippingProfileProductEntry', ShippingProfileProductEntrySchema);

