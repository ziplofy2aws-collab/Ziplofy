import mongoose, { Document, Model, Schema } from 'mongoose';

export type BuyXGetYGetsProductDiscountedValue = 'free' | 'amount' | 'percentage';

export interface IBuyXGetYGetsProductEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // BuyXGetYDiscount
  productId: mongoose.Types.ObjectId; // Product

  // At a discounted value
  discountedValue: BuyXGetYGetsProductDiscountedValue; // free | amount | percentage
  discountedAmount?: number; // when discountedValue = amount
  discountedPercentage?: number; // when discountedValue = percentage

  // Maximum uses per order
  setMaxUsesPerOrder?: boolean;
  maxUsesPerOrder?: number;

  createdAt: Date;
  updatedAt: Date;
}

const buyXGetYGetsProductEntrySchema = new Schema<IBuyXGetYGetsProductEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'BuyXGetYDiscount', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },

  // At a discounted value
  discountedValue: { type: String, enum: ['free', 'amount', 'percentage'], required: true },
  discountedAmount: { type: Number, min: 0 },
  discountedPercentage: { type: Number, min: 0, max: 100 },

  // Maximum uses per order
  setMaxUsesPerOrder: { type: Boolean, default: false },
  maxUsesPerOrder: { type: Number, min: 1 },
}, { timestamps: true, versionKey: false });

// Validation for conditional fields
buyXGetYGetsProductEntrySchema.pre('validate', function(next) {
  const doc = this as unknown as IBuyXGetYGetsProductEntry & Document;
  if (doc.discountedValue === 'amount' && (doc.discountedAmount === undefined || doc.discountedAmount === null)) {
    return next(new Error('discountedAmount is required when discountedValue is amount'));
  }
  if (doc.discountedValue === 'percentage' && (doc.discountedPercentage === undefined || doc.discountedPercentage === null)) {
    return next(new Error('discountedPercentage is required when discountedValue is percentage'));
  }
  if (doc.setMaxUsesPerOrder && (doc.maxUsesPerOrder === undefined || doc.maxUsesPerOrder === null)) {
    return next(new Error('maxUsesPerOrder is required when setMaxUsesPerOrder is true'));
  }
  next();
});

buyXGetYGetsProductEntrySchema.index({ storeId: 1, discountId: 1 });
buyXGetYGetsProductEntrySchema.index({ discountId: 1, productId: 1 });

export const BuyXGetYGetsProductEntry: Model<IBuyXGetYGetsProductEntry & Document> =
  mongoose.models.BuyXGetYGetsProductEntry ||
  mongoose.model<IBuyXGetYGetsProductEntry & Document>('BuyXGetYGetsProductEntry', buyXGetYGetsProductEntrySchema);
