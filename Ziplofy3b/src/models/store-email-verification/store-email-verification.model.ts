import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStoreEmailVerification {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  storeNotificationEmailId: mongoose.Types.ObjectId;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const storeEmailVerificationSchema = new Schema<IStoreEmailVerification & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
    },
    storeNotificationEmailId: {
      type: Schema.Types.ObjectId,
      ref: 'StoreNotificationEmail',
      required: [true, 'Store notification email ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required'],
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storeEmailVerificationSchema.index(
  { storeNotificationEmailId: 1, email: 1 },
  { name: 'store_email_verification_lookup' }
);

export const StoreEmailVerification: Model<IStoreEmailVerification & Document> =
  mongoose.model<IStoreEmailVerification & Document>(
    'StoreEmailVerification',
    storeEmailVerificationSchema
  );
