import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation {
  storeId: mongoose.Types.ObjectId;
  name: string;
  countryRegion: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  canShip: boolean;
  canLocalDeliver: boolean;
  canPickup: boolean;
  isFulfillmentAllowed: boolean;
  isActive: boolean;
}

export interface ILocationDocument extends ILocation, Document {
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocationDocument>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'storeId is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      maxlength: [200, 'Location name cannot exceed 200 characters'],
    },
    countryRegion: { type: String, required: [true, 'Country/Region is required'], trim: true },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    apartment: { type: String, trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, required: [true, 'State is required'], trim: true },
    postalCode: { type: String, required: [true, 'Postal/ZIP code is required'], trim: true },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    canShip: { type: Boolean, default: false },
    canLocalDeliver: { type: Boolean, default: false },
    canPickup: { type: Boolean, default: false },
    isFulfillmentAllowed: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const LocationModel = mongoose.model<ILocationDocument>('Location', locationSchema);


