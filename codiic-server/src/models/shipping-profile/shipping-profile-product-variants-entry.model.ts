import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingProfileProductVariantsEntry extends Document {
  shippingProfileId: mongoose.Types.ObjectId;
  productVariantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingProfileProductVariantsEntrySchema = new Schema<IShippingProfileProductVariantsEntry>(
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

// Compound unique index to prevent duplicate entries
ShippingProfileProductVariantsEntrySchema.index(
  { shippingProfileId: 1, productVariantId: 1, storeId: 1 },
  { unique: true }
);

export const ShippingProfileProductVariantsEntry: Model<IShippingProfileProductVariantsEntry> =
  mongoose.models.ShippingProfileProductVariantsEntry ||
  mongoose.model<IShippingProfileProductVariantsEntry>(
    'ShippingProfileProductVariantsEntry',
    ShippingProfileProductVariantsEntrySchema
  );

