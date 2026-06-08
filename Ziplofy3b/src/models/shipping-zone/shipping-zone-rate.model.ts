import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShippingZoneRate extends Document {
  shippingZoneId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  rateType: 'flat' | 'carrier';
  shippingRate: string; // e.g., 'custom'
  customRateName: string;
  customDeliveryDescription?: string;
  price: number;
  conditionalPricingEnabled: boolean;
  conditionalPricingBasis?: 'weight' | 'price';
  minWeight?: number;
  maxWeight?: number;
  minPrice?: number;
  maxPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingZoneRateSchema = new Schema<IShippingZoneRate>(
  {
    shippingZoneId: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingZone',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    rateType: {
      type: String,
      enum: ['flat', 'carrier'],
      required: true,
      default: 'flat',
    },
    shippingRate: {
      type: String,
      required: true,
      trim: true,
      default: 'custom',
    },
    customRateName: {
      type: String,
      required: true,
      trim: true,
    },
    customDeliveryDescription: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    conditionalPricingEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    conditionalPricingBasis: {
      type: String,
      enum: ['weight', 'price'],
    },
    minWeight: {
      type: Number,
      min: 0,
    },
    maxWeight: {
      type: Number,
      min: 0,
    },
    minPrice: {
      type: Number,
      min: 0,
    },
    maxPrice: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for efficient queries by shipping zone
ShippingZoneRateSchema.index({ shippingZoneId: 1, createdAt: -1 });

// Index for efficient queries by store
ShippingZoneRateSchema.index({ storeId: 1 });

// Compound index for shipping zone and rate name uniqueness (if needed)
// ShippingZoneRateSchema.index({ shippingZoneId: 1, customRateName: 1 }, { unique: true });

export const ShippingZoneRate: Model<IShippingZoneRate> =
  mongoose.models.ShippingZoneRate ||
  mongoose.model<IShippingZoneRate>('ShippingZoneRate', ShippingZoneRateSchema);

