import mongoose, { Document, Model, Schema } from "mongoose";

export const BLOG_COMMENT_STATUS = ["pending", "published", "spam"] as const;
export type BlogCommentStatus = (typeof BLOG_COMMENT_STATUS)[number];

export interface IBlogComment {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  articleId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  message: string;
  status: BlogCommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const blogCommentSchema = new Schema<IBlogComment & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    articleId: {
      type: Schema.Types.ObjectId,
      ref: "BlogPost",
      required: [true, "Article ID is required"],
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
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxLength: [5000, "Message cannot exceed 5000 characters"],
      minLength: [1, "Message is required"],
    },
    status: {
      type: String,
      enum: BLOG_COMMENT_STATUS,
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

blogCommentSchema.index({ storeId: 1, createdAt: -1 });
blogCommentSchema.index({ articleId: 1, createdAt: -1 });
blogCommentSchema.index({ storeId: 1, articleId: 1, createdAt: -1 });

export const BlogComment: Model<IBlogComment & Document> = mongoose.model<IBlogComment & Document>(
  "BlogComment",
  blogCommentSchema
);
