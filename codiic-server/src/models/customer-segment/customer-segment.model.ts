import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICustomerSegment {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSegmentSchema = new Schema<ICustomerSegment & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: [2, 'Segment name must be at least 2 characters'],
    maxLength: [120, 'Segment name cannot exceed 120 characters'],
  },
}, {
  timestamps: true,
  versionKey: false,
});

customerSegmentSchema.index({ storeId: 1, name: 1 }, { unique: true });

export const CustomerSegment: Model<ICustomerSegment & Document> =
  mongoose.model<ICustomerSegment & Document>('CustomerSegment', customerSegmentSchema);


