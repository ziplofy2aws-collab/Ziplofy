import mongoose, { Model, Schema } from "mongoose";

export type SuperAdminNotificationType =
  | "hireDeveloper"
  | "userRegistration"
  | "themeUpload"
  | "clientRequest"
  | "systemAlert";

// Do NOT extend Document here
export interface ISuperAdminNotification {
  _id: mongoose.Types.ObjectId;
  notificationType: SuperAdminNotificationType;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  timeSinceCreated?: string;
}

interface ISuperAdminNotificationModel extends Model<ISuperAdminNotification> {
  getByType(
    type: SuperAdminNotificationType
  ): Promise<ISuperAdminNotification[]>;
  getAll(): Promise<ISuperAdminNotification[]>;
}

const superAdminNotificationSchema = new Schema<ISuperAdminNotification, ISuperAdminNotificationModel>(
  {
    notificationType: {
      type: String,
      required: [true, "Notification type is required"],
      enum: [
        "hireDeveloper",
        "userRegistration",
        "themeUpload",
        "clientRequest",
        "systemAlert",
      ],
      default: "hireDeveloper",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Update updatedAt before saving
superAdminNotificationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
superAdminNotificationSchema.index({ notificationType: 1, createdAt: -1 });
superAdminNotificationSchema.index({ userId: 1, createdAt: -1 });


export const SuperAdminNotification = mongoose.model<
  ISuperAdminNotification,
  ISuperAdminNotificationModel
>("SuperAdminNotification", superAdminNotificationSchema);
