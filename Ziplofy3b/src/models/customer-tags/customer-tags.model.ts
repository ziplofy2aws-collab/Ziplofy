import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICustomerTags {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerTagsSchema = new Schema<ICustomerTags & Document>({
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
customerTagsSchema.index({ storeId: 1 });
customerTagsSchema.index({ name: 1 });
customerTagsSchema.index({ storeId: 1, name: 1 }, { unique: true });

export const CustomerTags: Model<ICustomerTags & Document> = mongoose.model<ICustomerTags & Document>("CustomerTags", customerTagsSchema);
