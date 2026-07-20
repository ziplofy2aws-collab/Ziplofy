import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotificationSettingsEmailVerificationToken {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
}

const notificationSettingsEmailVerificationTokenSchema =
  new Schema<INotificationSettingsEmailVerificationToken & Document>(
    {
      storeId: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Store ID is required'],
        index: true,
        unique: true,
      },
      token: {
        type: String,
        required: [true, 'Token is required'],
        unique: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: '24h',
      },
    },
    {
      versionKey: false,
    }
  );

export const NotificationSettingsEmailVerificationToken: Model<
  INotificationSettingsEmailVerificationToken & Document
> = mongoose.model<INotificationSettingsEmailVerificationToken & Document>(
  'NotificationSettingsEmailVerificationToken',
  notificationSettingsEmailVerificationTokenSchema
);

