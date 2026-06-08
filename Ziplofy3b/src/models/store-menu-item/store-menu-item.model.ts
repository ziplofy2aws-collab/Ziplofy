import mongoose, { Document, Model, Schema } from "mongoose";

export const MENU_ITEM_LINK_TYPES = [
  "homepage",
  "all-collections",
  "all-products",
  "specific-collection",
  "specific-product",
  "custom",
] as const;

export type MenuItemLinkType = (typeof MENU_ITEM_LINK_TYPES)[number];

export interface IStoreMenuItem {
  _id: mongoose.Types.ObjectId;
  menuId: mongoose.Types.ObjectId;
  label: string;
  linkType: MenuItemLinkType;
  /** Static path for `custom` links only; resolved at read-time for other types. */
  link?: string;
  collectionId?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const storeMenuItemSchema = new Schema<IStoreMenuItem & Document>(
  {
    menuId: {
      type: Schema.Types.ObjectId,
      ref: "StoreMenu",
      required: [true, "Menu ID is required"],
      index: true,
    },
    label: {
      type: String,
      required: [true, "Label is required"],
      trim: true,
      maxLength: [200, "Label cannot exceed 200 characters"],
      minLength: [1, "Label is required"],
    },
    linkType: {
      type: String,
      enum: MENU_ITEM_LINK_TYPES,
      required: [true, "Link type is required"],
    },
    link: {
      type: String,
      trim: true,
      maxLength: [2000, "Link cannot exceed 2000 characters"],
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collections",
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    position: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storeMenuItemSchema.index({ menuId: 1, position: 1 });

export const StoreMenuItem: Model<IStoreMenuItem & Document> = mongoose.model<IStoreMenuItem & Document>(
  "StoreMenuItem",
  storeMenuItemSchema
);
