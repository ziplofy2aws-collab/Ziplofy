import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBuyXGetYDiscountUsage {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // BuyXGetYDiscount
  customerId: mongoose.Types.ObjectId; // Customer
  orderId?: mongoose.Types.ObjectId; // Order
  usedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const buyXGetYDiscountUsageSchema = new Schema<IBuyXGetYDiscountUsage & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'BuyXGetYDiscount', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
  usedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true, versionKey: false });

// Compound indexes for efficient queries
buyXGetYDiscountUsageSchema.index({ storeId: 1, discountId: 1 });
buyXGetYDiscountUsageSchema.index({ customerId: 1, discountId: 1 });
buyXGetYDiscountUsageSchema.index({ discountId: 1, storeId: 1 });
buyXGetYDiscountUsageSchema.index({ storeId: 1, usedAt: -1 });

export const BuyXGetYDiscountUsage: Model<IBuyXGetYDiscountUsage & Document> =
  mongoose.models.BuyXGetYDiscountUsage ||
  mongoose.model<IBuyXGetYDiscountUsage & Document>('BuyXGetYDiscountUsage', buyXGetYDiscountUsageSchema);
