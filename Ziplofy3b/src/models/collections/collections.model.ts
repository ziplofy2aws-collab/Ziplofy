import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICollection {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  title: string;
  imageUrl?: string;
  imageAltText?: string;
  description: string;
  pageTitle: string; // base title for SEO
  metaDescription: string;
  urlHandle: string;
  productSort: 'manual' | 'title-asc' | 'title-desc' | 'price-high' | 'price-low' | 'newest' | 'oldest';
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection & Document>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: [true, "Store ID is required"],
  },
  title: {
    type: String,
    required: [true, "Collection title is required"],
    trim: true,
    maxLength: [200, "Title cannot exceed 200 characters"],
    minLength: [2, "Title must be at least 2 characters"],
  },
  imageUrl: {
    type: String,
    trim: true,
    maxLength: [2000, "Image URL cannot exceed 2000 characters"],
  },
  imageAltText: {
    type: String,
    trim: true,
    maxLength: [500, "Image alt text cannot exceed 500 characters"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxLength: [5000, "Description cannot exceed 5000 characters"],
  },
  pageTitle: {
    type: String,
    required: [true, "Page title is required"],
    trim: true,
    maxLength: [200, "Page title cannot exceed 200 characters"],
    minLength: [2, "Page title must be at least 2 characters"],
  },
  metaDescription: {
    type: String,
    required: [true, "Meta description is required"],
    trim: true,
    maxLength: [500, "Meta description cannot exceed 500 characters"],
    minLength: [10, "Meta description must be at least 10 characters"],
  },
  urlHandle: {
    type: String,
    required: [true, "URL handle is required"],
    trim: true,
    maxLength: [100, "URL handle cannot exceed 100 characters"],
    minLength: [2, "URL handle must be at least 2 characters"],
    match: [/^[a-z0-9-]+$/, "URL handle can only contain lowercase letters, numbers, and hyphens"],
  },
  productSort: {
    type: String,
    enum: ['manual', 'title-asc', 'title-desc', 'price-high', 'price-low', 'newest', 'oldest'],
    default: 'manual',
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published',
  },
}, {
  timestamps: true,
  versionKey: false,
});

collectionSchema.index({ title: 1 });
collectionSchema.index({ storeId: 1 });
collectionSchema.index({ urlHandle: 1 });
collectionSchema.index({ storeId: 1, urlHandle: 1 });
collectionSchema.index({ createdAt: -1 });
collectionSchema.index({ updatedAt: -1 });

export const Collections: Model<ICollection & Document> = mongoose.model<ICollection & Document>("Collections", collectionSchema);


