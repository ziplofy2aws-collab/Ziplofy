import mongoose, { Document, Model, Schema } from "mongoose";

export const STORE_PAGE_VISIBILITIES = ["visible", "hidden"] as const;
export type StorePageVisibility = (typeof STORE_PAGE_VISIBILITIES)[number];

export interface IStorePage {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  visibility: StorePageVisibility;
  themeTemplate: string;
  createdAt: Date;
  updatedAt: Date;
}

const storePageSchema = new Schema<IStorePage & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Page title is required"],
      trim: true,
      minLength: [1, "Page title is required"],
      maxLength: [255, "Title cannot exceed 255 characters"],
    },
    content: {
      type: String,
      default: "",
      maxLength: [1_000_000, "Content is too large"],
    },
    pageTitle: {
      type: String,
      trim: true,
      default: "",
      maxLength: [70, "SEO page title cannot exceed 70 characters"],
    },
    metaDescription: {
      type: String,
      trim: true,
      default: "",
      maxLength: [320, "Meta description cannot exceed 320 characters"],
    },
    urlHandle: {
      type: String,
      required: [true, "URL handle is required"],
      trim: true,
      lowercase: true,
      minLength: [1, "URL handle is required"],
      maxLength: [100, "URL handle cannot exceed 100 characters"],
      match: [/^[a-z0-9-]+$/, "URL handle can only contain lowercase letters, numbers, and hyphens"],
    },
    visibility: {
      type: String,
      enum: STORE_PAGE_VISIBILITIES,
      default: "hidden",
    },
    themeTemplate: {
      type: String,
      trim: true,
      lowercase: true,
      default: "default",
      maxLength: [80, "Theme template cannot exceed 80 characters"],
      match: [/^(default|pages(?:\.[a-z][a-z0-9_-]*)?)$/, "Invalid page template value"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storePageSchema.index({ storeId: 1, urlHandle: 1 }, { unique: true });
storePageSchema.index({ storeId: 1, updatedAt: -1 });

export const StorePage: Model<IStorePage & Document> = mongoose.model<IStorePage & Document>(
  "StorePage",
  storePageSchema
);
