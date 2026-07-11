import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogTags {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogTagsSchema = new Schema<IBlogTags & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
      maxLength: [50, "Tag name cannot exceed 50 characters"],
      minLength: [1, "Tag name must be at least 1 character"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

blogTagsSchema.index({ storeId: 1, createdAt: -1 });
blogTagsSchema.index({ storeId: 1, name: 1 }, { unique: true });

export const BlogTags: Model<IBlogTags & Document> = mongoose.model<IBlogTags & Document>(
  "BlogTags",
  blogTagsSchema
);
