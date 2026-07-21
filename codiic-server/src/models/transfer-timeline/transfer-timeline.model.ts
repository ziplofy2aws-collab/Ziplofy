import mongoose, { Document, Schema } from 'mongoose';

export interface ITransferTimeline {
  transferId: mongoose.Types.ObjectId; // Reference to Transfer
  type: 'comment' | 'event'; // Type of timeline entry
  comment: string; // For comments, user input. For events, system-generated message
}

export interface ITransferTimelineDocument extends ITransferTimeline, Document {}

const transferTimelineSchema = new Schema<ITransferTimelineDocument>(
  {
    transferId: {
      type: Schema.Types.ObjectId,
      ref: 'Transfer',
      required: [true, 'transferId is required'],
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
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const TransferTimelineModel = mongoose.model<ITransferTimelineDocument>('TransferTimeline', transferTimelineSchema);


