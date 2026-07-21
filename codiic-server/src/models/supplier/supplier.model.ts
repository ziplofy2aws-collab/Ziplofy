import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier {
  storeId: mongoose.Types.ObjectId; // Ref to Store
  company: string;
  countryOrRegion: string;
  address: string;
  apartmentSuite?: string;
  city: string;
  state: string;
  pinCode: string;
  contactName: string;
  email: string;
  phoneNumber: string;
}

export interface ISupplierDocument extends ISupplier, Document {}

const supplierSchema = new Schema<ISupplierDocument>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'storeId is required'],
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      maxlength: [200, 'Company cannot exceed 200 characters'],
    },
    countryOrRegion: {
      type: String,
      required: [true, 'Country/Region is required'],
      trim: true,
      maxlength: [100, 'Country/Region cannot exceed 100 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    apartmentSuite: {
      type: String,
      trim: true,
      maxlength: [100, 'Apartment/Suite cannot exceed 100 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters'],
    },
    pinCode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true,
      maxlength: [20, 'PIN code cannot exceed 20 characters'],
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: [120, 'Contact name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      maxlength: [254, 'Email cannot exceed 254 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

supplierSchema.index({ storeId: 1, company: 1, email: 1 }, { unique: false });

export const SupplierModel = mongoose.model<ISupplierDocument>('Supplier', supplierSchema);
