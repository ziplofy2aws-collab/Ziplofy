import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISupportDeveloper extends Document {
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const supportDeveloperSchema = new Schema<ISupportDeveloper>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for better query performance
supportDeveloperSchema.index({ email: 1 });
supportDeveloperSchema.index({ username: 1 });

export const SupportDeveloper: Model<ISupportDeveloper> = mongoose.model<ISupportDeveloper>(
  "SupportDeveloper",
  supportDeveloperSchema
);
