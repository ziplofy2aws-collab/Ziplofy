import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEditVerificationOtp extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const editVerificationOtpSchema = new Schema<IEditVerificationOtp>(
  {
    email: { type: String, required: true, lowercase: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

editVerificationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
editVerificationOtpSchema.index({ email: 1 });

export const EditVerificationOtp: Model<IEditVerificationOtp> =
  mongoose.model<IEditVerificationOtp>("EditVerificationOtp", editVerificationOtpSchema);
