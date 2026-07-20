import mongoose, { Document, Schema } from 'mongoose';

export interface CustomerSegment {
  segmentName: string;
  desc: string;
  customers: string[];
}

// Mongoose Document interface
export interface ICustomerSegmentDocument extends Document {
  segmentName: string;
  desc: string;
  customers: mongoose.Types.ObjectId[];
}

// Mongoose Schema
const customerSegmentSchema = new Schema<ICustomerSegmentDocument>({
  segmentName: {
    type: String,
    required: true,
    unique: true
  },
  desc: {
    type: String,
    required: true
  },
  customers: [{
    type: Schema.Types.ObjectId,
    ref: 'Customer'
  }]
}, {
  timestamps: true
});

// Mongoose Model
export const CustomerSegmentModel = mongoose.model<ICustomerSegmentDocument>('CustomerSegment', customerSegmentSchema);
