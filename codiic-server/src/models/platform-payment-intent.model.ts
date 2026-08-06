import mongoose, { Document, Model, Schema } from 'mongoose';

export type PlatformPaymentIntentStatus = 'submitted' | 'skipped';
export type PlatformPaymentMethod = 'upi' | 'card' | null;

export interface IPlatformPaymentIntent {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  goals: string[];
  paymentMethod: PlatformPaymentMethod;
  paymentHint: string;
  planName: string;
  amount: number;
  currency: string;
  status: PlatformPaymentIntentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const platformPaymentIntentSchema = new Schema<IPlatformPaymentIntent & Document>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, trim: true, lowercase: true },
    goals: { type: [String], default: [] },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', null],
      default: null,
    },
    paymentHint: { type: String, trim: true, default: '' },
    planName: { type: String, trim: true, default: 'Basic' },
    amount: { type: Number, default: 20 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['submitted', 'skipped'],
      default: 'submitted',
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

platformPaymentIntentSchema.index({ createdAt: -1 });

export const PlatformPaymentIntent: Model<IPlatformPaymentIntent & Document> =
  (mongoose.models.PlatformPaymentIntent as Model<IPlatformPaymentIntent & Document>) ||
  mongoose.model<IPlatformPaymentIntent & Document>(
    'PlatformPaymentIntent',
    platformPaymentIntentSchema
  );
