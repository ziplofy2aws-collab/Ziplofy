import mongoose, { Document, Model, Schema } from 'mongoose';

export type BuyXGetYMethod = 'discount-code' | 'automatic';
export type BuyXGetYCustomerBuys = 'minimum-quantity' | 'minimum-amount';
export type BuyXGetYAnyItemsFrom = 'specific-products' | 'specific-collections';
export type BuyXGetYGetsFrom = 'specific-products' | 'specific-collections';
export type BuyXGetYDiscountedValue = 'free' | 'amount' | 'percentage';
export type BuyXGetYEligibility = 'all-customers' | 'specific-customer-segments' | 'specific-customers';

export interface IBuyXGetYDiscount {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;

  // Method
  method: BuyXGetYMethod;
  discountCode?: string;
  title?: string;

  // Sales channel access (only for discount code in UI, but keep generic)
  allowDiscountOnChannels?: boolean;

  // Customer buys
  customerBuys: BuyXGetYCustomerBuys;
  quantity?: number; // when minimum-quantity
  amount?: number;   // when minimum-amount
  anyItemsFrom: BuyXGetYAnyItemsFrom; // specific-products | specific-collections

  // Customer gets
  customerGetsQuantity: number; // required
  customerGetsAnyItemsFrom: BuyXGetYGetsFrom; // specific-products | specific-collections
  discountedValue: BuyXGetYDiscountedValue; // free | amount | percentage
  discountedAmount?: number; // when discountedValue = amount
  discountedPercentage?: number; // when discountedValue = percentage

  setMaxUsersPerOrder?: boolean;
  maxUsersPerOrder?: number;

  // Eligibility
  eligibility: BuyXGetYEligibility;
  applyOnPOSPro?: boolean;

  // Max uses (only for discount code per UI, but keep generic)
  limitTotalUses?: boolean;
  totalUsesLimit?: number;
  limitOneUsePerCustomer?: boolean;

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

const buyXGetYSchema = new Schema<IBuyXGetYDiscount & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },

  method: { type: String, enum: ['discount-code', 'automatic'], required: true, index: true },
  discountCode: { type: String, trim: true },
  title: { type: String, trim: true },

  allowDiscountOnChannels: { type: Boolean, default: false },

  customerBuys: { type: String, enum: ['minimum-quantity', 'minimum-amount'], required: true },
  quantity: { type: Number, min: 0 },
  amount: { type: Number, min: 0 },
  anyItemsFrom: { type: String, enum: ['specific-products', 'specific-collections'], required: true },

  customerGetsQuantity: { type: Number, required: true, min: 1 },
  customerGetsAnyItemsFrom: { type: String, enum: ['specific-products', 'specific-collections'], required: true },
  discountedValue: { type: String, enum: ['free', 'amount', 'percentage'], required: true },
  discountedAmount: { type: Number, min: 0 },
  discountedPercentage: { type: Number, min: 0, max: 100 },

  setMaxUsersPerOrder: { type: Boolean, default: false },
  maxUsersPerOrder: { type: Number, min: 1 },

  eligibility: { type: String, enum: ['all-customers', 'specific-customer-segments', 'specific-customers'], required: true },
  applyOnPOSPro: { type: Boolean, default: false },

  limitTotalUses: { type: Boolean, default: false },
  totalUsesLimit: { type: Number, min: 1 },
  limitOneUsePerCustomer: { type: Boolean, default: false },

  productDiscounts: { type: Boolean, default: false },
  orderDiscounts: { type: Boolean, default: false },
  shippingDiscounts: { type: Boolean, default: false },

  startDate: { type: String },
  startTime: { type: String },
  setEndDate: { type: Boolean, default: false },
  endDate: { type: String },
  endTime: { type: String },

  status: { type: String, enum: ['active', 'draft'], default: 'active', index: true },
}, { timestamps: true, versionKey: false });

// Guardrails for conditional requirements
buyXGetYSchema.pre('validate', function(next) {
  const doc = this as unknown as IBuyXGetYDiscount & Document;
  if (doc.method === 'discount-code' && !doc.discountCode) {
    return next(new Error('discountCode is required when method is discount-code'));
  }
  if (doc.method === 'automatic' && !doc.title) {
    return next(new Error('title is required when method is automatic'));
  }
  if (doc.customerBuys === 'minimum-quantity' && (doc.quantity === undefined || doc.quantity === null)) {
    return next(new Error('quantity is required when customerBuys is minimum-quantity'));
  }
  if (doc.customerBuys === 'minimum-amount' && (doc.amount === undefined || doc.amount === null)) {
    return next(new Error('amount is required when customerBuys is minimum-amount'));
  }
  if (doc.discountedValue === 'amount' && (doc.discountedAmount === undefined || doc.discountedAmount === null)) {
    return next(new Error('discountedAmount is required when discountedValue is amount'));
  }
  if (doc.discountedValue === 'percentage' && (doc.discountedPercentage === undefined || doc.discountedPercentage === null)) {
    return next(new Error('discountedPercentage is required when discountedValue is percentage'));
  }
  next();
});

buyXGetYSchema.index({ storeId: 1, status: 1, createdAt: -1 });

export const BuyXGetYDiscount: Model<IBuyXGetYDiscount & Document> =
  mongoose.models.BuyXGetYDiscount || mongoose.model<IBuyXGetYDiscount & Document>('BuyXGetYDiscount', buyXGetYSchema);
