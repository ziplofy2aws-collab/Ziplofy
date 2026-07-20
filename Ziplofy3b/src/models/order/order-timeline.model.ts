import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderTimeline {
  orderId: mongoose.Types.ObjectId;
  type: 'comment' | 'event';
  comment: string;
}

export interface IOrderTimelineDocument extends IOrderTimeline, Document {}

const orderTimelineSchema = new Schema<IOrderTimelineDocument>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'orderId is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['comment', 'event'],
      required: [true, 'Type is required'],
      default: 'comment',
    },
    comment: {
      type: String,
      required: [true, 'comment is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderTimelineSchema.index({ orderId: 1, createdAt: -1 });

export const OrderTimelineModel = mongoose.model<IOrderTimelineDocument>('OrderTimeline', orderTimelineSchema);
