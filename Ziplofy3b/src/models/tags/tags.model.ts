import mongoose, { Document, Model, Schema } from "mongoose";

// Tags Interface
export interface ITags {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tags Schema
const tagsSchema = new Schema<ITags & Document>({
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

// Indexes for better performance
tagsSchema.index({ storeId: 1 });
tagsSchema.index({ name: 1 });
tagsSchema.index({ storeId: 1, name: 1 }, { unique: true }); // Ensure unique tag names per store

// Export the Tags model
export const Tags: Model<ITags & Document> = mongoose.model<ITags & Document>("Tags", tagsSchema);
