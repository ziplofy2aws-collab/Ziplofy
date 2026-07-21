import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILoginOtp extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const loginOtpSchema = new Schema<ILoginOtp>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true, lowercase: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// TTL index to auto-delete expired OTPs
loginOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
loginOtpSchema.index({ email: 1 });

export const LoginOtp: Model<ILoginOtp> = mongoose.model<ILoginOtp>("LoginOtp", loginOtpSchema);


