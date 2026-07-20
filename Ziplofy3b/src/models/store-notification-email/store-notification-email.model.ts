import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Store Notification Email Interface
export interface IStoreNotificationEmail {
  _id: mongoose.Types.ObjectId;
  storeId: Types.ObjectId;
  email: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Store Notification Email Schema
const storeNotificationEmailSchema = new Schema<IStoreNotificationEmail & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
      maxLength: [100, "Email cannot exceed 100 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
storeNotificationEmailSchema.index({ storeId: 1 });
storeNotificationEmailSchema.index({ email: 1 });

// Export the StoreNotificationEmail model
export const StoreNotificationEmail: Model<IStoreNotificationEmail & Document> = mongoose.model<IStoreNotificationEmail & Document>(
  "StoreNotificationEmail",
  storeNotificationEmailSchema
);

