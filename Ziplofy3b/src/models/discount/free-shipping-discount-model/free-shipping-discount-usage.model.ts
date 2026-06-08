import mongoose, { Document, Schema } from 'mongoose';

export interface IFreeShippingDiscountUsage extends Document {
  customerId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  usedAt: Date;
}

const FreeShippingDiscountUsageSchema = new Schema<IFreeShippingDiscountUsage>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  discountId: {
    type: Schema.Types.ObjectId,
    ref: 'FreeShippingDiscount',
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
FreeShippingDiscountUsageSchema.index({ customerId: 1, discountId: 1 });
FreeShippingDiscountUsageSchema.index({ discountId: 1, storeId: 1 });
FreeShippingDiscountUsageSchema.index({ storeId: 1, usedAt: -1 });

export const FreeShippingDiscountUsage = mongoose.model<IFreeShippingDiscountUsage>('FreeShippingDiscountUsage', FreeShippingDiscountUsageSchema);
