import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITransferEntry {
  _id: mongoose.Types.ObjectId;
  transferId: mongoose.Types.ObjectId;
  variantId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const transferEntrySchema = new Schema<ITransferEntry & Document>(
  {
    transferId: {
      type: Schema.Types.ObjectId,
      ref: "Transfer",
      required: true,
      index: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

transferEntrySchema.index({ transferId: 1, variantId: 1 });

export const TransferEntry: Model<ITransferEntry & Document> = mongoose.model<ITransferEntry & Document>(
  "TransferEntry",
  transferEntrySchema
);
