import mongoose, { Document, Schema } from "mongoose";

export type RequirementsFormStatus = "Initiated" | "Accepted" | "Declined";

export interface IRequirement {
  text: string;
  completed: boolean;
}

export interface IRequirementsForm {
  clientId: mongoose.Types.ObjectId;
  supportDeveloperId: mongoose.Types.ObjectId;
  requirements: IRequirement[];
  status: RequirementsFormStatus;
  createdAt: Date;
  updatedAt: Date;
}

const requirementsFormSchema = new Schema<IRequirementsForm & Document>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: "Client",
    required: [true, "Client ID is required"],
  },
  supportDeveloperId: {
    type: Schema.Types.ObjectId,
    ref: "SupportDeveloper",
    required: [true, "Support Developer ID is required"],
  },
  requirements: {
    type: [{
      text: {
        type: String,
        required: [true, "Requirement text is required"],
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      }
    }],
    required: [true, "Requirements list is required"],
  },
  status: {
    type: String,
    enum: {
      values: ["Initiated", "Accepted", "Declined"],
      message: "Status must be Initiated, Accepted, or Declined",
    },
    default: "Initiated",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for better query performance
requirementsFormSchema.index({ clientId: 1 });
requirementsFormSchema.index({ supportDeveloperId: 1 });
requirementsFormSchema.index({ status: 1 });
requirementsFormSchema.index({ createdAt: -1 });

export const RequirementsForm = mongoose.model<IRequirementsForm & Document>(
  "RequirementsForm",
  requirementsFormSchema
);
