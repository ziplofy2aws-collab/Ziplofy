import mongoose, { Document, Model, Schema } from 'mongoose';
import { CustomerNotifications } from '../../enums/customer-notifications.enum';
import { StaffNotifications } from '../../enums/staff-notifications.enum';
import { FulfillmentNotifications } from '../../enums/fulfillment-notifications.enum';

export interface INotificationOption {
  _id: mongoose.Types.ObjectId;
  notificationCategoryId: mongoose.Types.ObjectId;
  optionName: string;
  optionDesc?: string;
  toggle: boolean;
  toggleValue: string;
  emailSupported: boolean;
  smsSupported: boolean;
  segment?: string;
  emailBody?: string;
  emailSubject?: string;
  smsData?: string;
  availableVariables?: string[];
  key: CustomerNotifications | StaffNotifications | FulfillmentNotifications;
  createdAt: Date;
  updatedAt: Date;
}

const notificationOptionSchema = new Schema<INotificationOption & Document>(
  {
    notificationCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'NotificationCategory',
      required: [true, 'Notification category ID is required'],
      index: true,
    },
    optionName: {
      type: String,
      required: [true, 'Option name is required'],
      trim: true,
    },
    optionDesc: {
      type: String,
      trim: true,
      default: '',
    },
    toggle: {
      type: Boolean,
      default: false,
    },
    toggleValue: {
      type: String,
      trim: true,
      default: '',
    },
    emailSupported: {
      type: Boolean,
      default: false,
    },
    smsSupported: {
      type: Boolean,
      default: false,
    },
    segment: {
      type: String,
      trim: true,
      default: '',
    },
    emailBody: {
      type: String,
      default: '',
    },
    emailSubject: {
      type: String,
      trim: true,
      default: '',
    },
    smsData: {
      type: String,
      trim: true,
      default: '',
    },
    availableVariables: {
      type: [String],
      default: [],
    },
    key: {
      type: String,
      enum: [...Object.values(CustomerNotifications), ...Object.values(StaffNotifications), ...Object.values(FulfillmentNotifications)],
      required: [true, 'Notification option key is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationOptionSchema.index({ notificationCategoryId: 1, optionName: 1 }, { unique: true });

export const NotificationOption: Model<INotificationOption & Document> =
  mongoose.model<INotificationOption & Document>('NotificationOption', notificationOptionSchema);


