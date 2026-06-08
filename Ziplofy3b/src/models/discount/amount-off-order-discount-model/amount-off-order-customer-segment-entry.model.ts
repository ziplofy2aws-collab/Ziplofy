import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAmountOffOrderCustomerSegmentEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // AmountOffOrderDiscount
  customerSegmentId: mongoose.Types.ObjectId; // CustomerSegment
  createdAt: Date;
  updatedAt: Date;
}

const amountOffOrderCustomerSegmentEntrySchema = new Schema<IAmountOffOrderCustomerSegmentEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'AmountOffOrderDiscount', required: true, index: true },
  customerSegmentId: { type: Schema.Types.ObjectId, ref: 'CustomerSegment', required: true, index: true },
}, { timestamps: true, versionKey: false });

amountOffOrderCustomerSegmentEntrySchema.index({ storeId: 1, discountId: 1 });

export const AmountOffOrderCustomerSegmentEntry: Model<IAmountOffOrderCustomerSegmentEntry & Document> =
  mongoose.models.AmountOffOrderCustomerSegmentEntry ||
  mongoose.model<IAmountOffOrderCustomerSegmentEntry & Document>('AmountOffOrderCustomerSegmentEntry', amountOffOrderCustomerSegmentEntrySchema);
