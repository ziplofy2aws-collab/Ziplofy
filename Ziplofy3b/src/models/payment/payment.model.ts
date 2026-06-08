import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Manual UPI / payment confirmation records (payer name, email, UTR) tied to a store and customer.
 */
export interface IPayment extends Document {
  storeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  /** Unique per store (same UTR cannot be submitted twice for one store). */
  utr: string;
  referenceId: string;
  amountPaise: number | null;
  merchantName: string | null;
  /** Client reference e.g. pending order label — not necessarily a persisted Order _id yet. */
  orderId: string | null;
}

const paymentSchema = new Schema<IPayment>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    utr: { type: String, required: true, trim: true },
    referenceId: { type: String, required: true, trim: true },
    amountPaise: { type: Number, default: null },
    merchantName: { type: String, default: null, trim: true },
    orderId: { type: String, default: null, trim: true },
  },
  { timestamps: true, versionKey: false }
);

paymentSchema.index({ storeId: 1, utr: 1 }, { unique: true });
paymentSchema.index({ storeId: 1, customerId: 1, createdAt: -1 });

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);
