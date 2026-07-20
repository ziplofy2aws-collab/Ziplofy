import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITransferTag {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const transferTagSchema = new Schema<ITransferTag & Document>({
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
  versionKey: false,
});

// Indexes
transferTagSchema.index({ storeId: 1 });
transferTagSchema.index({ name: 1 });
transferTagSchema.index({ storeId: 1, name: 1 }, { unique: true });

export const TransferTagModel: Model<ITransferTag & Document> = mongoose.model<ITransferTag & Document>("TransferTag", transferTagSchema);


