import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingProfile extends Document {
  profileName: string;
  storeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingProfileSchema = new Schema<IShippingProfile>(
  {
    profileName: {
      type: String,
      required: true,
      trim: true,
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

// Index for efficient queries by store
ShippingProfileSchema.index({ storeId: 1, createdAt: -1 });

// Compound unique index for store + profile name
ShippingProfileSchema.index({ storeId: 1, profileName: 1 }, { unique: true });

export const ShippingProfile: Model<IShippingProfile> =
  mongoose.models.ShippingProfile ||
  mongoose.model<IShippingProfile>('ShippingProfile', ShippingProfileSchema);

