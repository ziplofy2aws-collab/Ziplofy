import mongoose, { Schema, Document } from 'mongoose';

export type DeliveryZoneType = 'radius' | 'pin-codes';
export type RadiusUnit = 'km' | 'mi';

export interface ILocalDeliveryLocationEntry {
  localDeliveryId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  canLocalDeliver: boolean;
  deliveryZoneType: DeliveryZoneType;
  includeNeighboringStates: boolean;
  radiusUnit: RadiusUnit;
  currencyCode: string;
  currencySymbol?: string;
}

const localDeliveryLocationEntrySchema = new Schema<LocalDeliveryLocationEntryDocument>(
  {
    localDeliveryId: {
      type: Schema.Types.ObjectId,
      ref: 'LocalDeliverySettings',
      required: true,
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    canLocalDeliver: {
      type: Boolean,
      default: true,
    },
    deliveryZoneType: {
      type: String,
      enum: ['radius', 'pin-codes'],
      default: 'radius',
    },
    includeNeighboringStates: {
      type: Boolean,
      default: false,
    },
    radiusUnit: {
      type: String,
      enum: ['km', 'mi'],
      default: 'km',
    },
    currencyCode: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    currencySymbol: {
      type: String,
      default: '₹',
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

localDeliveryLocationEntrySchema.index({ localDeliveryId: 1, locationId: 1 }, { unique: true });

export type LocalDeliveryLocationEntryDocument = ILocalDeliveryLocationEntry & Document;

export const LocalDeliveryLocationEntry =
  mongoose.models.LocalDeliveryLocationEntry ||
  mongoose.model<LocalDeliveryLocationEntryDocument>(
    'LocalDeliveryLocationEntry',
    localDeliveryLocationEntrySchema
  );


