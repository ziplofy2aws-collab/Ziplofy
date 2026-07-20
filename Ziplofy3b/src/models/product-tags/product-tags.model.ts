import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProductTags {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const productTagsSchema = new Schema<IProductTags & Document>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: [true, "Store ID is required"],
  },
  name: {
    type: String,
    required: [true, "Tag name is required"],
    trim: true,
    maxLength: [50, "Tag name cannot exceed 50 characters"],
    minLength: [1, "Tag name must be at least 1 character"],
  },
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
productTagsSchema.index({ storeId: 1 });
productTagsSchema.index({ name: 1 });
productTagsSchema.index({ storeId: 1, name: 1 }, { unique: true });

export const ProductTags: Model<IProductTags & Document> = mongoose.model<IProductTags & Document>("ProductTags", productTagsSchema);
