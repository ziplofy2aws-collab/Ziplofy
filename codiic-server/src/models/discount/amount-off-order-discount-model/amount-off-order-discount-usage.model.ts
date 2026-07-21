import mongoose, { Document, Schema } from 'mongoose';

export interface IAmountOffOrderDiscountUsage extends Document {
  customerId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  usedAt: Date;
}

const AmountOffOrderDiscountUsageSchema = new Schema<IAmountOffOrderDiscountUsage>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  discountId: {
    type: Schema.Types.ObjectId,
    ref: 'AmountOffOrderDiscount',
    required: true,
    index: true
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  usedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
AmountOffOrderDiscountUsageSchema.index({ customerId: 1, discountId: 1 });
AmountOffOrderDiscountUsageSchema.index({ discountId: 1, storeId: 1 });
AmountOffOrderDiscountUsageSchema.index({ storeId: 1, usedAt: -1 });

export const AmountOffOrderDiscountUsage = mongoose.model<IAmountOffOrderDiscountUsage>('AmountOffOrderDiscountUsage', AmountOffOrderDiscountUsageSchema);
