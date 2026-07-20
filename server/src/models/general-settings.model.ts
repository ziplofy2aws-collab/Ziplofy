import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGeneralSettings extends Document {
  storeId: mongoose.Types.ObjectId;

  // Store defaults
  backupRegion: string;
  unitSystem: 'metric' | 'imperial';
  weightUnit: 'kg' | 'g' | 'lb' | 'oz';
  timeZone: string;

  // Order ID formatting
  orderIdPrefix: string;
  orderIdSuffix: string;

  // Order processing
  fulfillmentOption: 'fulfill_all' | 'fulfill_gift_cards' | 'dont_fulfill';
  notifyCustomers: boolean;
  fulfillHighRiskOrders: boolean;
  autoArchive: boolean;

  // Store contact profile (editable modal)
  storeName?: string;
  storeEmail?: string;
  storePhone?: string;

  // Billing information (editable modal)
  legalBusinessName?: string;
  billingCountry?: string;
  billingAddress?: string;
  billingApartment?: string;
  billingCity?: string;
  billingState?: string;
  billingPinCode?: string;

  createdAt: Date;
  updatedAt: Date;
}

const generalSettingsSchema = new Schema<IGeneralSettings>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
      unique: true,
    },
    backupRegion: {
      type: String,
      default: 'India',
      trim: true,
    },
    unitSystem: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric',
    },
    weightUnit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg',
    },
    timeZone: {
      type: String,
      default: 'Asia/Kolkata',
      trim: true,
    },
    orderIdPrefix: {
      type: String,
      default: '#',
      trim: true,
    },
    orderIdSuffix: {
      type: String,
      default: '',
      trim: true,
    },
    fulfillmentOption: {
      type: String,
      enum: ['fulfill_all', 'fulfill_gift_cards', 'dont_fulfill'],
      default: 'dont_fulfill',
    },
    notifyCustomers: {
      type: Boolean,
      default: false,
    },
    fulfillHighRiskOrders: {
      type: Boolean,
      default: false,
    },
    autoArchive: {
      type: Boolean,
      default: true,
    },
    storeName: {
      type: String,
      trim: true,
      default: undefined,
    },
    storeEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    storePhone: {
      type: String,
      trim: true,
      default: undefined,
    },
    legalBusinessName: {
      type: String,
      trim: true,
      default: undefined,
    },
    billingCountry: {
      type: String,
      trim: true,
      default: undefined,
    },
    billingAddress: {
      type: String,
      trim: true,
      default: undefined,
    },
    billingApartment: {
      type: String,
      trim: true,
      default: undefined,
    },
    billingCity: {
      type: String,
      trim: true,
      default: undefined,
    },
    billingState: {
      type: String,
      trim: true,
      default: undefined,
    },
    billingPinCode: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  { timestamps: true, versionKey: false }
);

generalSettingsSchema.index({ storeId: 1 });

export const GeneralSettings: Model<IGeneralSettings> =
  mongoose.models.GeneralSettings || mongoose.model<IGeneralSettings>('GeneralSettings', generalSettingsSchema);

