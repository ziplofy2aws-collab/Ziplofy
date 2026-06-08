import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotificationCategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationCategorySchema = new Schema<INotificationCategory & Document>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationCategorySchema.index({ name: 1 }, { unique: true });

export const NotificationCategory: Model<INotificationCategory & Document> =
  mongoose.model<INotificationCategory & Document>(
    'NotificationCategory',
    notificationCategorySchema
  );

