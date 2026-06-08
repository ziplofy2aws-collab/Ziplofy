import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotificationSettings {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  senderEmail: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSettingsSchema = new Schema<INotificationSettings & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
      unique: true,
    },
    senderEmail: {
      type: String,
      required: [true, 'Sender email is required'],
      trim: true,
      lowercase: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSettingsSchema.index({ storeId: 1 }, { unique: true });

export const NotificationSettings: Model<INotificationSettings & Document> =
  mongoose.model<INotificationSettings & Document>(
    'NotificationSettings',
    notificationSettingsSchema
  );

