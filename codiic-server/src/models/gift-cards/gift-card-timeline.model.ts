import mongoose, { Document, Schema } from 'mongoose';

export interface IGiftCardTimeline {
  giftCardId: mongoose.Types.ObjectId; // Reference to GiftCard
  type: 'comment' | 'event'; // Type of timeline entry
  comment: string; // For comments, this is user input. For events, this is system-generated message
}

export interface IGiftCardTimelineDocument extends IGiftCardTimeline, Document {}

const giftCardTimelineSchema = new Schema<IGiftCardTimelineDocument>(
  {
    giftCardId: {
      type: Schema.Types.ObjectId,
      ref: 'GiftCard',
      required: [true, 'giftCardId is required'],
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

export const GiftCardTimelineModel = mongoose.model<IGiftCardTimelineDocument>('GiftCardTimeline', giftCardTimelineSchema);
