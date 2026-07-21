import mongoose, { Document, Schema } from 'mongoose';

export interface IUnavailable {
  damaged: number;
  qualityControl: number;
  safetyStock: number;
  other: number;
}

export interface IInventoryLevel {
  variantId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  onHand: number;
  committed: number;
  unavailable: IUnavailable;
  available: number;
  incoming: number;
}

export interface IInventoryLevelDocument extends IInventoryLevel, Document {
  createdAt: Date;
  updatedAt: Date;
}

const unavailableSchema = new Schema<IUnavailable>(
  {
    damaged: { type: Number, default: 0 },
    qualityControl: { type: Number, default: 0 },
    safetyStock: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  { _id: false }
);

const inventoryLevelSchema = new Schema<IInventoryLevelDocument>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: [true, 'variantId is required'],
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'locationId is required'],
      index: true,
    },
    onHand: { type: Number, default: 0, min: 0 },
    committed: { type: Number, default: 0, min: 0 },
    unavailable: { type: unavailableSchema, default: () => ({}) },
    available: { type: Number, default: 0, min: 0 },
    incoming: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  }
);

// Optional index for uniqueness
inventoryLevelSchema.index({ variantId: 1, locationId: 1 }, { unique: true });

export const InventoryLevelModel = mongoose.model<IInventoryLevelDocument>(
  'InventoryLevel',
  inventoryLevelSchema
);
