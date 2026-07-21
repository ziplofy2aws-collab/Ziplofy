import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBuyXGetYCustomerSegmentEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // BuyXGetYDiscount
  customerSegmentId: mongoose.Types.ObjectId; // CustomerSegment
  createdAt: Date;
  updatedAt: Date;
}

const buyXGetYCustomerSegmentEntrySchema = new Schema<IBuyXGetYCustomerSegmentEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'BuyXGetYDiscount', required: true, index: true },
  customerSegmentId: { type: Schema.Types.ObjectId, ref: 'CustomerSegment', required: true, index: true },
}, { timestamps: true, versionKey: false });

buyXGetYCustomerSegmentEntrySchema.index({ storeId: 1, discountId: 1 });
buyXGetYCustomerSegmentEntrySchema.index({ discountId: 1, customerSegmentId: 1 });

export const BuyXGetYCustomerSegmentEntry: Model<IBuyXGetYCustomerSegmentEntry & Document> =
  mongoose.models.BuyXGetYCustomerSegmentEntry ||
  mongoose.model<IBuyXGetYCustomerSegmentEntry & Document>('BuyXGetYCustomerSegmentEntry', buyXGetYCustomerSegmentEntrySchema);
