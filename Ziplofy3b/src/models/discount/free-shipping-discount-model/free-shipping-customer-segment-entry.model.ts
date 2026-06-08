import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFreeShippingCustomerSegmentEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // FreeShippingDiscount
  customerSegmentId: mongoose.Types.ObjectId; // CustomerSegment
  createdAt: Date;
  updatedAt: Date;
}

const freeShippingCustomerSegmentEntrySchema = new Schema<IFreeShippingCustomerSegmentEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'FreeShippingDiscount', required: true, index: true },
  customerSegmentId: { type: Schema.Types.ObjectId, ref: 'CustomerSegment', required: true, index: true },
}, { timestamps: true, versionKey: false });

freeShippingCustomerSegmentEntrySchema.index({ storeId: 1, discountId: 1 });

export const FreeShippingCustomerSegmentEntry: Model<IFreeShippingCustomerSegmentEntry & Document> =
  mongoose.models.FreeShippingCustomerSegmentEntry || mongoose.model<IFreeShippingCustomerSegmentEntry & Document>('FreeShippingCustomerSegmentEntry', freeShippingCustomerSegmentEntrySchema);
