import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Checkout editor configuration for a store (branding, layout blocks, page customizations).
 * One document per store — mirrors the JSON-driven pattern used by StoreCustomTheme.
 */
export interface IStoreCheckoutConfiguration extends Document {
  storeId: mongoose.Types.ObjectId;
  /** Full checkout editor document: header, main, order summary, footer, theme settings, etc. */
  checkoutConfig: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const storeCheckoutConfigurationSchema = new Schema<IStoreCheckoutConfiguration>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      unique: true,
      index: true,
    },
    checkoutConfig: {
      type: Schema.Types.Mixed,
      required: [true, 'Checkout config is required'],
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'storeCheckoutConfigurations',
  }
);

storeCheckoutConfigurationSchema.index({ storeId: 1 }, { unique: true });

export const StoreCheckoutConfiguration: Model<IStoreCheckoutConfiguration> =
  mongoose.models.StoreCheckoutConfiguration ||
  mongoose.model<IStoreCheckoutConfiguration>(
    'StoreCheckoutConfiguration',
    storeCheckoutConfigurationSchema
  );
