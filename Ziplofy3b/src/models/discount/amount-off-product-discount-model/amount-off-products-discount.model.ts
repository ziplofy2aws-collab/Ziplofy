import mongoose, { Document, Model, Schema } from 'mongoose';

export type DiscountMethod = 'discount-code' | 'automatic';
export type EligibilityType = 'all-customers' | 'specific-customer-segments' | 'specific-customers';
export type AppliesToType = 'specific-collections' | 'specific-products';
export type DiscountValueType = 'percentage' | 'fixed-amount';

export interface IAmountOffProductsDiscount {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;

  // Method
  method: DiscountMethod;
  discountCode?: string; // required when method === 'discount-code'
  title?: string; // required when method === 'automatic'

  // Sales channel and usage limits (only for discount-code)
  allowDiscountOnChannels?: boolean;
  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;

  // Discount value
  valueType: DiscountValueType;
  percentage?: number; // required when valueType === 'percentage'
  fixedAmount?: number; // required when valueType === 'fixed-amount'

  // Applies to (assignment targets are handled via separate DiscountEntry model)
  appliesTo: AppliesToType; // specific-collections | specific-products

  // Per-item vs once per order
  oncePerOrder?: boolean; // if false/undefined -> per eligible item

  // Eligibility
  eligibility: EligibilityType;
  applyOnPOSPro?: boolean; // only for automatic + all-customers

  // Minimum purchase requirements
  minimumPurchase?: 'no-requirements' | 'minimum-amount' | 'minimum-quantity';
  minimumAmount?: number;
  minimumQuantity?: number;

  // Combinations
  productDiscounts?: boolean;
  orderDiscounts?: boolean;
  shippingDiscounts?: boolean;

  // Active dates
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  setEndDate?: boolean;
  endDate?: string;
  endTime?: string;

  status?: 'active' | 'draft';

  createdAt: Date;
  updatedAt: Date;
}

const amountOffProductsDiscountSchema = new Schema<IAmountOffProductsDiscount & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },

  method: { type: String, enum: ['discount-code', 'automatic'], required: true, index: true },
  discountCode: { type: String, trim: true },
  title: { type: String, trim: true },

  allowDiscountOnChannels: { type: Boolean, default: false },
  limitTotalUses: { type: Boolean, default: false },
  totalUsesLimit: { type: Number, min: 1 },
  limitOneUsePerCustomer: { type: Boolean, default: false },

  valueType: { type: String, enum: ['percentage', 'fixed-amount'], required: true },
  percentage: { type: Number, min: 0, max: 100 },
  fixedAmount: { type: Number, min: 0 },

  appliesTo: { type: String, enum: ['specific-collections', 'specific-products'], required: true },
  oncePerOrder: { type: Boolean, default: false },

  eligibility: { type: String, enum: ['all-customers', 'specific-customer-segments', 'specific-customers'], required: true },
  applyOnPOSPro: { type: Boolean, default: false },

  minimumPurchase: { type: String, enum: ['no-requirements', 'minimum-amount', 'minimum-quantity'], default: 'no-requirements' },
  minimumAmount: { type: Number, min: 0 },
  minimumQuantity: { type: Number, min: 0 },

  productDiscounts: { type: Boolean, default: false },
  orderDiscounts: { type: Boolean, default: false },
  shippingDiscounts: { type: Boolean, default: false },

  startDate: { type: String },
  startTime: { type: String },
  setEndDate: { type: Boolean, default: false },
  endDate: { type: String },
  endTime: { type: String },

  status: { type: String, enum: ['active', 'draft'], default: 'active', index: true },
}, {
  timestamps: true,
  versionKey: false,
});

// Guardrails for method/valueType
amountOffProductsDiscountSchema.pre('validate', function(next) {
  const doc = this as unknown as IAmountOffProductsDiscount & Document;
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
  if (doc.method === 'automatic' && doc.eligibility === 'all-customers') {
    // applyOnPOSPro is optional; default already defined
  }
  next();
});

amountOffProductsDiscountSchema.index({ storeId: 1, status: 1, createdAt: -1 });

// Check if model already exists to prevent duplicate registration
const AmountOffProductsDiscount: Model<IAmountOffProductsDiscount & Document> = 
  mongoose.models.AmountOffProductsDiscount || 
  mongoose.model<IAmountOffProductsDiscount & Document>('AmountOffProductsDiscount', amountOffProductsDiscountSchema);

export { AmountOffProductsDiscount };


