import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStoreMenu {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  menuName: string;
  /** URL-friendly identifier derived from menuName (e.g. "sidebar-menu"). */
  handle: string;
  createdAt: Date;
  updatedAt: Date;
}

const storeMenuSchema = new Schema<IStoreMenu & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    menuName: {
      type: String,
      required: [true, "Menu name is required"],
      trim: true,
      maxLength: [200, "Menu name cannot exceed 200 characters"],
      minLength: [1, "Menu name is required"],
    },
    handle: {
      type: String,
      required: [true, "Menu handle is required"],
      trim: true,
      lowercase: true,
      maxLength: [100, "Handle cannot exceed 100 characters"],
      match: [/^[a-z0-9-]+$/, "Handle can only contain lowercase letters, numbers, and hyphens"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storeMenuSchema.index({ storeId: 1, handle: 1 }, { unique: true });
storeMenuSchema.index({ storeId: 1, createdAt: -1 });

export const StoreMenu: Model<IStoreMenu & Document> = mongoose.model<IStoreMenu & Document>(
  "StoreMenu",
  storeMenuSchema
);
