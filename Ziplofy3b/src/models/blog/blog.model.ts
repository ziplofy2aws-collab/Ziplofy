import mongoose, { Document, Model, Schema } from "mongoose";

export const BLOG_COMMENTS_MODES = ["disabled", "moderated", "allowed"] as const;
export type BlogCommentsMode = (typeof BLOG_COMMENTS_MODES)[number];

export interface IBlog {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  title: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  comments: BlogCommentsMode;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxLength: [255, "Title cannot exceed 255 characters"],
      minLength: [1, "Blog title is required"],
    },
    pageTitle: {
      type: String,
      required: [true, "Page title is required"],
      trim: true,
      maxLength: [70, "Page title cannot exceed 70 characters"],
      minLength: [1, "Page title is required"],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxLength: [320, "Meta description cannot exceed 320 characters"],
      default: "",
    },
    urlHandle: {
      type: String,
      required: [true, "URL handle is required"],
      trim: true,
      lowercase: true,
      maxLength: [100, "URL handle cannot exceed 100 characters"],
      minLength: [1, "URL handle is required"],
      match: [/^[a-z0-9-]+$/, "URL handle can only contain lowercase letters, numbers, and hyphens"],
    },
    comments: {
      type: String,
      enum: BLOG_COMMENTS_MODES,
      default: "disabled",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

blogSchema.index({ storeId: 1, urlHandle: 1 }, { unique: true });
blogSchema.index({ storeId: 1, updatedAt: -1 });

export const Blog: Model<IBlog & Document> = mongoose.model<IBlog & Document>("Blog", blogSchema);
