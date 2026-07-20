import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICustomerSegmentEntry {
  _id: mongoose.Types.ObjectId;
  segmentId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customerSegmentEntrySchema = new Schema<ICustomerSegmentEntry & Document>({
  segmentId: { type: Schema.Types.ObjectId, ref: 'CustomerSegment', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
}, {
  timestamps: true,
  versionKey: false,
});

// prevent duplicate assignment of the same customer to the same segment
customerSegmentEntrySchema.index({ segmentId: 1, customerId: 1 }, { unique: true });

export const CustomerSegmentEntry: Model<ICustomerSegmentEntry & Document> =
  mongoose.model<ICustomerSegmentEntry & Document>('CustomerSegmentEntry', customerSegmentEntrySchema);


