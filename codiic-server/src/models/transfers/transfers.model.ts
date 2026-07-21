import mongoose, { Document, Model, Schema } from "mongoose";

export type TransferStatus =
  | "draft"
  | "ready_to_ship"
  | "in_progress"
  | "transferred"
  | "cancelled";

export interface ITransfer {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  originLocationId: mongoose.Types.ObjectId;
  destinationLocationId: mongoose.Types.ObjectId;
  referenceName?: string;
  note?: string;
  tags: mongoose.Types.ObjectId[];
  transferDate?: Date;
  receivedDate?: Date;
  status: TransferStatus;
  createdAt: Date;
  updatedAt: Date;
}

const transferSchema = new Schema<ITransfer & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    originLocationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    destinationLocationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    referenceName: {
      type: String,
      trim: true,
    },

    note: {
      type: String,
      trim: true,
    },

    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "TransferTag",
      },
    ],

    transferDate: {
      type: Date,
      default: Date.now,
    },

    receivedDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["draft", "ready_to_ship", "in_progress", "transferred", "cancelled"],
      default: "draft",
    },
  },
  { timestamps: true, versionKey: false }
);

transferSchema.index({ storeId: 1, createdAt: -1 });

export const Transfer: Model<ITransfer & Document> = mongoose.model<ITransfer & Document>("Transfer", transferSchema);
