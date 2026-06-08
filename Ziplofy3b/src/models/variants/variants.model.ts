import mongoose, { Document, Model, Schema } from "mongoose";

// Variants Interface
export interface IVariants {
  _id: mongoose.Types.ObjectId;
  name: string;
  values: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Variants Schema
const variantsSchema = new Schema<IVariants & Document>({
  name: {
    type: String,
    required: [true, "Variant name is required"],
    trim: true,
    maxLength: [100, "Variant name cannot exceed 100 characters"],
    minLength: [2, "Variant name must be at least 2 characters"],
    unique: true,
  },
  values: [{
    type: String,
    required: [true, "Variant value is required"],
    trim: true,
    maxLength: [100, "Variant value cannot exceed 100 characters"],
    minLength: [1, "Variant value must be at least 1 character"],
  }],
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
variantsSchema.index({ name: 1 });
variantsSchema.index({ values: 1 });
variantsSchema.index({ createdAt: -1 });
variantsSchema.index({ updatedAt: -1 });

// Text search index for searching variants
variantsSchema.index({
  name: 'text',
  values: 'text'
});

// Export the Variants model
export const Variants: Model<IVariants & Document> = mongoose.model<IVariants & Document>("Variants", variantsSchema);
