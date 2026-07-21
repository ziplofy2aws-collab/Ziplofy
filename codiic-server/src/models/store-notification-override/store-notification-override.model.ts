import mongoose, { Document, Model, Schema } from 'mongoose';
import { CustomerNotifications } from '../../enums/customer-notifications.enum';
import { StaffNotifications } from '../../enums/staff-notifications.enum';
import { FulfillmentNotifications } from '../../enums/fulfillment-notifications.enum';

export interface IStoreNotificationOverride {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  notificationOptionId: mongoose.Types.ObjectId;
  notificationKey: CustomerNotifications | StaffNotifications | FulfillmentNotifications | string;
  emailSubject?: string;
  emailBody?: string;
  smsData?: string;
  enabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storeNotificationOverrideSchema = new Schema<IStoreNotificationOverride & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
    },
    notificationKey: {
      type: String,
      required: [true, 'Notification key is required'],
      enum: [
        ...Object.values(CustomerNotifications),
        ...Object.values(StaffNotifications),
        ...Object.values(FulfillmentNotifications),
      ],
    },
    notificationOptionId: {
      type: Schema.Types.ObjectId,
      ref: 'NotificationOption',
      required: [true, 'Notification option ID is required'],
      index: true,
    },
    emailSubject: {
      type: String,
      trim: true,
    },
    emailBody: {
      type: String,
    },
    smsData: {
      type: String,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storeNotificationOverrideSchema.index(
  { storeId: 1, notificationKey: 1 },
  { unique: true, name: 'store_notification_key_unique' }
);

storeNotificationOverrideSchema.index(
  { storeId: 1, notificationOptionId: 1 },
  { unique: true, name: 'store_notification_option_unique' }
);

export const StoreNotificationOverride: Model<IStoreNotificationOverride & Document> =
  mongoose.model<IStoreNotificationOverride & Document>(
    'StoreNotificationOverride',
    storeNotificationOverrideSchema
  );


