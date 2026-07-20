import mongoose, { Document, Schema } from 'mongoose';

// Vendor Interface
export interface IVendor {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vendor Schema
const vendorSchema = new Schema<IVendor & Document>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: [true, "Store ID is required"],
  },
  name: {
    type: String,
    required: [true, "Vendor name is required"],
    trim: true,
    maxLength: [100, "Vendor name cannot exceed 100 characters"],
    minLength: [2, "Vendor name must be at least 2 characters"],
  },
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
vendorSchema.index({ storeId: 1 });
vendorSchema.index({ name: 1 });
vendorSchema.index({ storeId: 1, name: 1 }, { unique: true });

// Create and export the model
export const Vendor = mongoose.model<IVendor & Document>('Vendor', vendorSchema);
