import mongoose, { Document, Model, Schema } from "mongoose";

export const BLOG_POST_VISIBILITY = ["visible", "hidden"] as const;
export type BlogPostVisibility = (typeof BLOG_POST_VISIBILITY)[number];

export interface IBlogPost {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  blogId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  excerpt: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  visibility: BlogPostVisibility;
  author: string;
  tagIds: mongoose.Types.ObjectId[];
  featuredImageUrl: string;
  featuredImageKey: string;
  featuredImageUploadId: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: [true, "Blog ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Blog post title is required"],
      trim: true,
      maxLength: [255, "Title cannot exceed 255 characters"],
      minLength: [1, "Blog post title is required"],
    },
    content: {
      type: String,
      default: "",
    },
    excerpt: {
      type: String,
      default: "",
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
    visibility: {
      type: String,
      enum: BLOG_POST_VISIBILITY,
      default: "hidden",
    },
    author: {
      type: String,
      trim: true,
      maxLength: [120, "Author cannot exceed 120 characters"],
      default: "",
    },
    tagIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "BlogTags" }],
      default: [],
    },
    featuredImageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    featuredImageKey: {
      type: String,
      trim: true,
      default: "",
    },
    featuredImageUploadId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

blogPostSchema.index({ blogId: 1, urlHandle: 1 }, { unique: true });
blogPostSchema.index({ storeId: 1, updatedAt: -1 });
blogPostSchema.index({ blogId: 1, updatedAt: -1 });
blogPostSchema.index({ tagIds: 1 });

export const BlogPost: Model<IBlogPost & Document> = mongoose.model<IBlogPost & Document>(
  "BlogPost",
  blogPostSchema
);
