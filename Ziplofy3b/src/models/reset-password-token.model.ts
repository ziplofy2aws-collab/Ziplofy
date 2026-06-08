import mongoose, { Document, Model, Schema } from "mongoose";

// ResetPasswordToken interface for TypeScript
export interface IResetPasswordToken {
  _id: mongoose.Types.ObjectId;
  token: string;
  userId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const resetPasswordTokenSchema = new Schema<IResetPasswordToken & Document>({
  token: {
    type: String,
    required: [true, "Token is required"],
    unique: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: [true, "User ID is required"],
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: [true, "Store ID is required"],
  },
  expiresAt: {
    type: Date,
    required: [true, "Expiration date is required"],
    index: { expireAfterSeconds: 0 }, // MongoDB TTL index
  },
}, { timestamps: true, versionKey: false });

// Index for efficient queries
resetPasswordTokenSchema.index({ token: 1 });
resetPasswordTokenSchema.index({ userId: 1 });
resetPasswordTokenSchema.index({ storeId: 1 });

export const ResetPasswordToken: Model<IResetPasswordToken & Document> = mongoose.model<IResetPasswordToken & Document>("ResetPasswordToken", resetPasswordTokenSchema);
