import mongoose, { Document, Model, Schema } from "mongoose";
import crypto from "crypto";

export interface IPendingAdminUser extends Document {
  email: string;
  name: string;
  password: string;
  role: mongoose.Types.ObjectId;
  verificationToken: string;
  expiresAt: Date;
  createdAt: Date;
}

const pendingAdminUserSchema = new Schema<IPendingAdminUser>(
  {
    email: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    verificationToken: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

pendingAdminUserSchema.index({ verificationToken: 1 }, { unique: true });
pendingAdminUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingAdminUser: Model<IPendingAdminUser> = mongoose.model<IPendingAdminUser>(
  "PendingAdminUser",
  pendingAdminUserSchema
);

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
