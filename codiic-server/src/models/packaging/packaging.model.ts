import mongoose, { Document, Model, Schema } from "mongoose";

// Package Type enum
export type PackageType = "box" | "envelope" | "soft_package";

// Packaging Interface
export interface IPackaging {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  packageName: string;
  packageType: PackageType;
  length: number;
  width: number;
  height: number;
  dimensionsUnit: "cm" | "in";
  weight: number;
  weightUnit: "g" | "kg" | "oz" | "lb";
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Main Packaging Schema
const packagingSchema = new Schema<IPackaging & Document>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: [true, "Store ID is required"],
  },
  packageName: {
    type: String,
    required: [true, "Package name is required"],
    trim: true,
    maxLength: [100, "Package name cannot exceed 100 characters"],
    minLength: [2, "Package name must be at least 2 characters"],
  },
  packageType: {
    type: String,
    required: [true, "Package type is required"],
    enum: {
      values: ['box', 'envelope', 'soft_package'],
      message: 'Package type must be one of: box, envelope, soft_package'
    },
  },
  length: {
    type: Number,
    required: [true, "Length is required"],
    min: [0, "Length cannot be negative"],
  },
  width: {
    type: Number,
    required: [true, "Width is required"],
    min: [0, "Width cannot be negative"],
  },
  height: {
    type: Number,
    required: [true, "Height is required"],
    min: [0, "Height cannot be negative"],
  },
  dimensionsUnit: {
    type: String,
    required: [true, "Dimensions unit is required"],
    trim: true,
    maxLength: [20, "Dimensions unit cannot exceed 20 characters"],
    enum: {
      values: ['cm', 'in'],
      message: 'Dimensions unit must be either cm or in'
    },
  },
  weight: {
    type: Number,
    required: [true, "Weight is required"],
    min: [0, "Weight cannot be negative"],
  },
  weightUnit: {
    type: String,
    required: [true, "Weight unit is required"],
    trim: true,
    maxLength: [20, "Weight unit cannot exceed 20 characters"],
    enum: {
      values: ['g', 'kg', 'oz', 'lb'],
      message: 'Weight unit must be one of: g, kg, oz, lb'
    },
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
packagingSchema.index({ storeId: 1 });
packagingSchema.index({ storeId: 1, packageName: 1 }); // Index for package name per store (allows duplicate names)
packagingSchema.index({ storeId: 1, isDefault: 1 }); // For finding default packages
packagingSchema.index({ packageType: 1 }); // For filtering by package type
packagingSchema.index({ dimensionsUnit: 1 });
packagingSchema.index({ weightUnit: 1 });
packagingSchema.index({ createdAt: -1 });
packagingSchema.index({ updatedAt: -1 });

// Text search index for searching packaging
packagingSchema.index({
  packageName: 'text'
});

// Export the Packaging model
export const Packaging: Model<IPackaging & Document> = mongoose.model<IPackaging & Document>("Packaging", packagingSchema);