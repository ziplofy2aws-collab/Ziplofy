import mongoose, { Document, Model, Schema } from "mongoose";

// Store interface for TypeScript
export interface IStore {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  storeName: string;
  storeDescription: string;
  defaultLocation?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore & Document>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  storeName: {
    type: String,
    required: [true, "Store name is required"],
    trim: true,
    maxLength: [100, "Store name cannot exceed 100 characters"],
    minLength: [2, "Store name must be at least 2 characters"],
  },
  storeDescription: {
    type: String,
    required: [true, "Store description is required"],
    trim: true,
    maxLength: [500, "Store description cannot exceed 500 characters"],
    minLength: [10, "Store description must be at least 10 characters"],
  },
  defaultLocation: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    default: null,
    index: true
  },
}, {
  timestamps: true,
  versionKey: false
});

// Index for better query performance
storeSchema.index({ userId: 1 });
storeSchema.index({ storeName: 1 });

// Ensure one store per user (optional constraint)
storeSchema.index({ userId: 1 }, { unique: true });

export const Store: Model<IStore & Document> = mongoose.model<IStore & Document>("Store", storeSchema);
