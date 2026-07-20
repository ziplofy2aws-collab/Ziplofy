import mongoose, { Document, Model, Schema } from "mongoose";

// Customer Timeline Interface
export interface ICustomerTimeline {
  _id: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Timeline Schema
const customerTimelineSchema = new Schema<ICustomerTimeline & Document>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: [true, "Customer ID is required"],
  },
  comment: {
    type: String,
    required: [true, "Comment is required"],
    trim: true,
    maxLength: [1000, "Comment cannot exceed 1000 characters"],
    minLength: [1, "Comment must be at least 1 character"],
  },
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
customerTimelineSchema.index({ customerId: 1 });
customerTimelineSchema.index({ createdAt: -1 });
customerTimelineSchema.index({ customerId: 1, createdAt: -1 });

// Export the CustomerTimeline model
export const CustomerTimeline: Model<ICustomerTimeline & Document> = mongoose.model<ICustomerTimeline & Document>("CustomerTimeline", customerTimelineSchema);
