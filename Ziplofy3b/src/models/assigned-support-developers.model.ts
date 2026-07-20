import mongoose, { Document, Schema } from "mongoose";

export interface IAssignedSupportDeveloper extends Document {
  adminId: mongoose.Types.ObjectId;
  supportDeveloperId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: "active" | "completed" | "cancelled";
  assignedAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const assignedSupportDeveloperSchema = new Schema<IAssignedSupportDeveloper>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin ID is required"],
    },
    supportDeveloperId: {
      type: Schema.Types.ObjectId,
      ref: "SupportDeveloper",
      required: [true, "Support Developer ID is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
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
    timestamps: false,
  }
);

// Update updatedAt before saving
assignedSupportDeveloperSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
assignedSupportDeveloperSchema.index({ adminId: 1 });
assignedSupportDeveloperSchema.index({ supportDeveloperId: 1 });
assignedSupportDeveloperSchema.index({ userId: 1 });
assignedSupportDeveloperSchema.index({ status: 1 });

export const AssignedSupportDevelopers = mongoose.model<IAssignedSupportDeveloper>(
  "AssignedSupportDevelopers",
  assignedSupportDeveloperSchema
);
