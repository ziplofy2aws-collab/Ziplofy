import mongoose, { Document, Model, Schema } from "mongoose";

// Category Interface
export interface ICategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  parent: mongoose.Types.ObjectId | null;
  hasChildren: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category Schema
const categorySchema = new Schema<ICategory & Document>({
  name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true,
    maxLength: [100, "Category name cannot exceed 100 characters"],
    minLength: [2, "Category name must be at least 2 characters"],
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  hasChildren: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ hasChildren: 1 });
categorySchema.index({ createdAt: -1 });
categorySchema.index({ updatedAt: -1 });

// Text search index for searching categories
categorySchema.index({
  name: 'text'
});

// Export the Category model
export const Category: Model<ICategory & Document> = mongoose.model<ICategory & Document>("Category", categorySchema);