import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAmountOffProductsCustomerSegmentEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // AmountOffProductsDiscount
  customerSegmentId: mongoose.Types.ObjectId; // CustomerSegment
  createdAt: Date;
  updatedAt: Date;
}

const amountOffProductsCustomerSegmentEntrySchema = new Schema<IAmountOffProductsCustomerSegmentEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'AmountOffProductsDiscount', required: true, index: true },
  customerSegmentId: { type: Schema.Types.ObjectId, ref: 'CustomerSegment', required: true, index: true },
}, { timestamps: true, versionKey: false });

amountOffProductsCustomerSegmentEntrySchema.index({ storeId: 1, discountId: 1 });
amountOffProductsCustomerSegmentEntrySchema.index({ discountId: 1, customerSegmentId: 1 });

const AmountOffProductsCustomerSegmentEntry: Model<IAmountOffProductsCustomerSegmentEntry & Document> =
  mongoose.models.AmountOffProductsCustomerSegmentEntry ||
  mongoose.model<IAmountOffProductsCustomerSegmentEntry & Document>(
    'AmountOffProductsCustomerSegmentEntry',
    amountOffProductsCustomerSegmentEntrySchema
  );

export { AmountOffProductsCustomerSegmentEntry };
