import mongoose, { Document, Model, Schema } from 'mongoose';

export type FS_Method = 'discount-code' | 'automatic';
export type FS_Eligibility = 'all-customers' | 'specific-customer-segments' | 'specific-customers';
export type FS_MinimumPurchase = 'no-requirements' | 'minimum-amount' | 'minimum-quantity';
export type FS_CountrySelection = 'all-countries' | 'selected-countries';

export interface IFreeShippingDiscount {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;

  // Method
  method: FS_Method;
  discountCode?: string; // required when method === 'discount-code'
  title?: string; // required when method === 'automatic'

  // Country (selected countries stored in FreeShippingCountryEntry)
  countrySelection: FS_CountrySelection; // all-countries | selected-countries
  excludeShippingRates?: boolean; // Exclude shipping rates over a certain amount
  shippingRateLimit?: number; // Amount threshold in currency units

  // Eligibility
  eligibility: FS_Eligibility;
  applyOnPOSPro?: boolean; // Only meaningful for automatic + all-customers

  // Minimum purchase requirements (applies to entire order)
  minimumPurchase: FS_MinimumPurchase;
  minimumAmount?: number;
  minimumQuantity?: number;

  // Sales channel access (only for discount code in UI)
  allowDiscountOnChannels?: boolean;

  // Maximum discount uses (only for discount code in UI)
  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;

  // Combinations
  productDiscounts?: boolean;
  orderDiscounts?: boolean;

  // Active dates
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;

  // Status
  status?: 'active' | 'draft';

  createdAt: Date;
  updatedAt: Date;
}

const freeShippingSchema = new Schema<IFreeShippingDiscount & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },

  method: { type: String, enum: ['discount-code', 'automatic'], required: true, index: true },
  discountCode: { type: String, trim: true },
  title: { type: String, trim: true },

  countrySelection: { type: String, enum: ['all-countries', 'selected-countries'], required: true },
  excludeShippingRates: { type: Boolean, default: false },
  shippingRateLimit: { type: Number, min: 0 },

  eligibility: { type: String, enum: ['all-customers', 'specific-customer-segments', 'specific-customers'], required: true },
  applyOnPOSPro: { type: Boolean, default: false },

  minimumPurchase: { type: String, enum: ['no-requirements', 'minimum-amount', 'minimum-quantity'], default: 'no-requirements' },
  minimumAmount: { type: Number, min: 0 },
  minimumQuantity: { type: Number, min: 0 },

  allowDiscountOnChannels: { type: Boolean, default: false },
  limitTotalUses: { type: Boolean, default: false },
  totalUsesLimit: { type: Number, min: 1 },
  limitOneUsePerCustomer: { type: Boolean, default: false },

  productDiscounts: { type: Boolean, default: false },
  orderDiscounts: { type: Boolean, default: false },

  startDate: { type: String },
  startTime: { type: String },
  setEndDate: { type: Boolean, default: false },
  endDate: { type: String },
  endTime: { type: String },

  status: { type: String, enum: ['active', 'draft'], default: 'active', index: true },
}, { timestamps: true, versionKey: false });

// Guard validations aligned with UI form logic
freeShippingSchema.pre('validate', function(next) {
  const doc = this as unknown as IFreeShippingDiscount & Document;

  if (doc.method === 'discount-code' && !doc.discountCode) {
    return next(new Error('discountCode is required when method is discount-code'));
  }
  if (doc.method === 'automatic' && !doc.title) {
    return next(new Error('title is required when method is automatic'));
  }
  // selected countries are validated in controller (stored in FreeShippingCountryEntry)
  if (doc.excludeShippingRates && (doc.shippingRateLimit === undefined || doc.shippingRateLimit === null)) {
    return next(new Error('shippingRateLimit is required when excludeShippingRates is true'));
  }
  if (doc.minimumPurchase === 'minimum-amount' && (doc.minimumAmount === undefined || doc.minimumAmount === null)) {
    return next(new Error('minimumAmount is required when minimumPurchase is minimum-amount'));
  }
  if (doc.minimumPurchase === 'minimum-quantity' && (doc.minimumQuantity === undefined || doc.minimumQuantity === null)) {
    return next(new Error('minimumQuantity is required when minimumPurchase is minimum-quantity'));
  }

  next();
});

freeShippingSchema.index({ storeId: 1, status: 1, createdAt: -1 });

export const FreeShippingDiscount: Model<IFreeShippingDiscount & Document> =
  mongoose.models.FreeShippingDiscount || mongoose.model<IFreeShippingDiscount & Document>('FreeShippingDiscount', freeShippingSchema);
