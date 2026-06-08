import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICustomerAddress {
  _id: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  countryId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  phoneNumber: string;
  addressType: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerAddressSchema = new Schema<ICustomerAddress & Document>({
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: [true, "Customer ID is required"] },
  countryId: { type: Schema.Types.ObjectId, ref: "Country", required: [true, "Country ID is required"], index: true },
  firstName: { type: String, required: [true, "First name is required"], trim: true, maxLength: [50, "First name cannot exceed 50 characters"] },
  lastName: { type: String, required: [true, "Last name is required"], trim: true, maxLength: [50, "Last name cannot exceed 50 characters"] },
  company: { type: String, trim: true, maxLength: [100, "Company name cannot exceed 100 characters"] },
  address: { type: String, required: [true, "Address is required"], trim: true, maxLength: [200, "Address cannot exceed 200 characters"] },
  apartment: { type: String, trim: true, maxLength: [50, "Apartment/suite cannot exceed 50 characters"] },
  city: { type: String, required: [true, "City is required"], trim: true, maxLength: [100, "City cannot exceed 100 characters"] },
  state: { type: String, required: [true, "State is required"], trim: true, maxLength: [100, "State cannot exceed 100 characters"] },
  pinCode: { type: String, required: [true, "Pin code is required"], trim: true, maxLength: [20, "Pin code cannot exceed 20 characters"] },
  phoneNumber: { type: String, required: [true, "Phone number is required"], trim: true, maxLength: [20, "Phone number cannot exceed 20 characters"] },
  addressType: { type: String, default: 'home' },
}, { timestamps: true, versionKey: false });

customerAddressSchema.index({ countryId: 1, city: 1 });
customerAddressSchema.index({ customerId: 1, createdAt: -1 });

export const CustomerAddress: Model<ICustomerAddress & Document> = mongoose.model<ICustomerAddress & Document>("CustomerAddress", customerAddressSchema);


