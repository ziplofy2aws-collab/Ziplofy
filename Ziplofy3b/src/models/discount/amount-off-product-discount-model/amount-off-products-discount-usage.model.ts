import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAmountOffProductsDiscountUsage {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // AmountOffProductsDiscount
  customerId: mongoose.Types.ObjectId; // Customer
  orderId?: mongoose.Types.ObjectId | null; // Order
  usedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const amountOffProductsDiscountUsageSchema = new Schema<IAmountOffProductsDiscountUsage & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'AmountOffProductsDiscount', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', default: null },
  usedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true, versionKey: false });

amountOffProductsDiscountUsageSchema.index({ storeId: 1, discountId: 1 });
amountOffProductsDiscountUsageSchema.index({ customerId: 1, discountId: 1 });
amountOffProductsDiscountUsageSchema.index({ discountId: 1, storeId: 1 });
amountOffProductsDiscountUsageSchema.index({ storeId: 1, usedAt: -1 });

const AmountOffProductsDiscountUsage: Model<IAmountOffProductsDiscountUsage & Document> =
  mongoose.models.AmountOffProductsDiscountUsage ||
  mongoose.model<IAmountOffProductsDiscountUsage & Document>(
    'AmountOffProductsDiscountUsage',
    amountOffProductsDiscountUsageSchema
  );

export { AmountOffProductsDiscountUsage };
