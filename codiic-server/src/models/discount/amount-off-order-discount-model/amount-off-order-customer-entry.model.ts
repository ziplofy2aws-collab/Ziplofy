import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAmountOffOrderCustomerEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // AmountOffOrderDiscount
  customerId: mongoose.Types.ObjectId; // Customer
  createdAt: Date;
  updatedAt: Date;
}

const amountOffOrderCustomerEntrySchema = new Schema<IAmountOffOrderCustomerEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'AmountOffOrderDiscount', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
}, { timestamps: true, versionKey: false });

amountOffOrderCustomerEntrySchema.index({ storeId: 1, discountId: 1 });

export const AmountOffOrderCustomerEntry: Model<IAmountOffOrderCustomerEntry & Document> =
  mongoose.models.AmountOffOrderCustomerEntry ||
  mongoose.model<IAmountOffOrderCustomerEntry & Document>('AmountOffOrderCustomerEntry', amountOffOrderCustomerEntrySchema);
