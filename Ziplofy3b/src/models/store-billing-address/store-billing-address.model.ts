import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStoreBillingAddress {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  legalBusinessName: string;
  country: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const storeBillingAddressSchema = new Schema<IStoreBillingAddress & Document>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: [true, "Store ID is required"],
    index: true,
  },
  legalBusinessName: {
    type: String,
    required: [true, "Legal business name is required"],
    trim: true,
    maxLength: [150, "Legal business name cannot exceed 150 characters"],
  },
  country: {
    type: String,
    required: [true, "Country is required"],
    trim: true,
    maxLength: [100, "Country cannot exceed 100 characters"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
    maxLength: [200, "Address cannot exceed 200 characters"],
  },
  apartment: {
    type: String,
    trim: true,
    maxLength: [50, "Apartment/suite cannot exceed 50 characters"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
    maxLength: [100, "City cannot exceed 100 characters"],
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
    maxLength: [100, "State cannot exceed 100 characters"],
  },
  pinCode: {
    type: String,
    required: [true, "PIN code is required"],
    trim: true,
    maxLength: [20, "PIN code cannot exceed 20 characters"],
  },
}, { timestamps: true, versionKey: false });

storeBillingAddressSchema.index({ storeId: 1, createdAt: -1 });

export const StoreBillingAddress: Model<IStoreBillingAddress & Document> = mongoose.model<IStoreBillingAddress & Document>("StoreBillingAddress", storeBillingAddressSchema);


