import mongoose, { Schema, Document } from 'mongoose';
import { RadiusUnit } from './local-delivery-location-entry.model';

export type ZoneType = 'radius' | 'pin-codes';

export interface ILocalDeliveryLocationZone {
  localDeliveryLocationEntryId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  zoneType: ZoneType;
  name: string;
  radius?: {
    max: number;
    unit: RadiusUnit;
    includeNeighboringStates?: boolean;
  };
  postalCodes?: string[];
  minOrderPrice?: number | null;
  deliveryPrice?: number;
  deliveryInformation?: string;
  conditionalPricing?: Array<{
    minOrder: number;
    maxOrder?: number | null;
    deliveryPrice: number;
  }>;
}

const localDeliveryLocationZoneSchema = new Schema<LocalDeliveryLocationZoneDocument>(
  {
    localDeliveryLocationEntryId: {
      type: Schema.Types.ObjectId,
      ref: 'LocalDeliveryLocationEntry',
      required: true,
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    zoneType: {
      type: String,
      enum: ['radius', 'pin-codes'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    radius: {
      max: { type: Number, min: 0 },
      unit: { type: String, enum: ['km', 'mi'], default: 'km' },
      includeNeighboringStates: { type: Boolean, default: false },
    },
    postalCodes: {
      type: [String],
      validate: {
        validator: function (value: string[]) {
          if (!value) return true;
          return value.length <= 5000;
        },
        message: 'A maximum of 5000 postal codes can be stored per zone',
      },
    },
    minOrderPrice: { type: Number, min: 0, default: null },
    deliveryPrice: { type: Number, min: 0, default: null },
    deliveryInformation: { type: String, maxlength: 255, default: undefined },
    conditionalPricing: {
      type: [
        {
          minOrder: { type: Number, required: true, min: 0 },
          maxOrder: { type: Number, min: 0, default: null },
          deliveryPrice: { type: Number, required: true, min: 0 },
        },
      ],
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

localDeliveryLocationZoneSchema.index(
  { localDeliveryLocationEntryId: 1, name: 1 },
  { unique: true, partialFilterExpression: { localDeliveryLocationEntryId: { $exists: true } } }
);

export type LocalDeliveryLocationZoneDocument = ILocalDeliveryLocationZone & Document;

export const LocalDeliveryLocationZone =
  mongoose.models.LocalDeliveryLocationZone ||
  mongoose.model<LocalDeliveryLocationZoneDocument>(
    'LocalDeliveryLocationZone',
    localDeliveryLocationZoneSchema
  );

