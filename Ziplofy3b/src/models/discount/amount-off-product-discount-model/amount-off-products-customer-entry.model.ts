import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAmountOffProductsCustomerEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // AmountOffProductsDiscount
  customerId: mongoose.Types.ObjectId; // Customer
  createdAt: Date;
  updatedAt: Date;
}

const amountOffProductsCustomerEntrySchema = new Schema<IAmountOffProductsCustomerEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'AmountOffProductsDiscount', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
}, { timestamps: true, versionKey: false });

amountOffProductsCustomerEntrySchema.index({ storeId: 1, discountId: 1 });
amountOffProductsCustomerEntrySchema.index({ discountId: 1, customerId: 1 });

const AmountOffProductsCustomerEntry: Model<IAmountOffProductsCustomerEntry & Document> =
  mongoose.models.AmountOffProductsCustomerEntry ||
  mongoose.model<IAmountOffProductsCustomerEntry & Document>(
    'AmountOffProductsCustomerEntry',
    amountOffProductsCustomerEntrySchema
  );

export { AmountOffProductsCustomerEntry };
