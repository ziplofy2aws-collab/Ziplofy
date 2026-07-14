import mongoose, { Document, Model, Schema } from "mongoose";

export const CONTACT_FORM_SUBMISSION_STATUS = ["pending", "read", "spam"] as const;
export type ContactFormSubmissionStatus = (typeof CONTACT_FORM_SUBMISSION_STATUS)[number];

export interface IContactFormSubmission {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactFormSubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const contactFormSubmissionSchema = new Schema<IContactFormSubmission & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [120, "Name cannot exceed 120 characters"],
      minLength: [1, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxLength: [255, "Email cannot exceed 255 characters"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      maxLength: [40, "Phone cannot exceed 40 characters"],
      default: undefined,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxLength: [5000, "Message cannot exceed 5000 characters"],
      minLength: [1, "Message is required"],
    },
    status: {
      type: String,
      enum: CONTACT_FORM_SUBMISSION_STATUS,
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

contactFormSubmissionSchema.index({ storeId: 1, createdAt: -1 });
contactFormSubmissionSchema.index({ storeId: 1, status: 1, createdAt: -1 });

export const ContactFormSubmission: Model<IContactFormSubmission & Document> =
  mongoose.models.ContactFormSubmission ||
  mongoose.model<IContactFormSubmission & Document>(
    "ContactFormSubmission",
    contactFormSubmissionSchema
  );
