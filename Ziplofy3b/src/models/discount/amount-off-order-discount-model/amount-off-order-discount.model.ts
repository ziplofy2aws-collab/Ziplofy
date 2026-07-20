import mongoose, { Document, Model, Schema } from 'mongoose';

export type AOO_Method = 'discount-code' | 'automatic';
export type AOO_ValueType = 'percentage' | 'fixed-amount';
export type AOO_Eligibility = 'all-customers' | 'specific-customer-segments' | 'specific-customers';
export type AOO_MinimumPurchase = 'no-requirements' | 'minimum-amount' | 'minimum-quantity';
export interface IAmountOffOrderDiscount {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;

  // Method
  method: AOO_Method;
  discountCode?: string; // required when method === 'discount-code'
  title?: string; // required when method === 'automatic'

  // Value
  valueType: AOO_ValueType; // percentage | fixed-amount
  percentage?: number; // required when percentage
  fixedAmount?: number; // required when fixed-amount

  // Eligibility
  eligibility: AOO_Eligibility;
  applyOnPOSPro?: boolean; // only meaningful for automatic + all-customers

  // Minimum purchase requirements (applies to entire order)
  minimumPurchase?: AOO_MinimumPurchase;
  minimumAmount?: number;
  minimumQuantity?: number;

  // Combinations
  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;

  // Sales channel (only surfaced for discount code in UI)
  allowDiscountOnChannels?: boolean;

  // Limits (only surfaced for discount code in UI)
  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;

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

const amountOffOrderSchema = new Schema<IAmountOffOrderDiscount & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },

  method: { type: String, enum: ['discount-code', 'automatic'], required: true, index: true },
  discountCode: { type: String, trim: true },
  title: { type: String, trim: true },

  valueType: { type: String, enum: ['percentage', 'fixed-amount'], required: true },
  percentage: { type: Number, min: 0, max: 100 },
  fixedAmount: { type: Number, min: 0 },

  eligibility: { type: String, enum: ['all-customers', 'specific-customer-segments', 'specific-customers'], required: true },
  applyOnPOSPro: { type: Boolean, default: false },

  minimumPurchase: { type: String, enum: ['no-requirements', 'minimum-amount', 'minimum-quantity'], default: 'no-requirements' },
  minimumAmount: { type: Number, min: 0 },
  minimumQuantity: { type: Number, min: 0 },

  productDiscounts: { type: Boolean, default: false },
  orderDiscounts: { type: Boolean, default: false },
  shippingDiscounts: { type: Boolean, default: false },

  allowDiscountOnChannels: { type: Boolean, default: false },
  limitTotalUses: { type: Boolean, default: false },
  totalUsesLimit: { type: Number, min: 1 },
  limitOneUsePerCustomer: { type: Boolean, default: false },

  startDate: { type: String },
  startTime: { type: String },
  setEndDate: { type: Boolean, default: false },
  endDate: { type: String },
  endTime: { type: String },

  status: { type: String, enum: ['active', 'draft'], default: 'active', index: true },
}, { timestamps: true, versionKey: false });

// Guard validations
amountOffOrderSchema.pre('validate', function(next) {
  const doc = this as unknown as IAmountOffOrderDiscount & Document;
  if (doc.method === 'discount-code' && !doc.discountCode) {
    return next(new Error('discountCode is required when method is discount-code'));
  }
  if (doc.method === 'automatic' && !doc.title) {
    return next(new Error('title is required when method is automatic'));
  }
  if (doc.valueType === 'percentage' && (doc.percentage === undefined || doc.percentage === null)) {
    return next(new Error('percentage is required when valueType is percentage'));
  }
  if (doc.valueType === 'fixed-amount' && (doc.fixedAmount === undefined || doc.fixedAmount === null)) {
    return next(new Error('fixedAmount is required when valueType is fixed-amount'));
  }
  if (doc.minimumPurchase === 'minimum-amount' && (doc.minimumAmount === undefined || doc.minimumAmount === null)) {
    return next(new Error('minimumAmount is required when minimumPurchase is minimum-amount'));
  }
  if (doc.minimumPurchase === 'minimum-quantity' && (doc.minimumQuantity === undefined || doc.minimumQuantity === null)) {
    return next(new Error('minimumQuantity is required when minimumPurchase is minimum-quantity'));
  }
  next();
});

amountOffOrderSchema.index({ storeId: 1, status: 1, createdAt: -1 });

export const AmountOffOrderDiscount: Model<IAmountOffOrderDiscount & Document> =
  mongoose.models.AmountOffOrderDiscount || mongoose.model<IAmountOffOrderDiscount & Document>('AmountOffOrderDiscount', amountOffOrderSchema);
