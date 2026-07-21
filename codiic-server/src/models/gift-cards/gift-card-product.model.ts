import mongoose, { Document, Model, Schema } from 'mongoose';

export type GiftCardProductStatus = 'active' | 'draft';
export type GiftCardRedemptionScope = 'all_currencies' | 'store_currency';

export interface IGiftCardProduct {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  imageUrls: string[];
  /** Preset purchase amounts customers can buy, e.g. [10, 25, 50, 100]. */
  denominations: number[];
  storeCurrencyCode: string;
  redemptionScope: GiftCardRedemptionScope;
  status: GiftCardProductStatus;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  productType?: mongoose.Types.ObjectId | null;
  vendor?: mongoose.Types.ObjectId | null;
  tagIds: mongoose.Types.ObjectId[];
  themeTemplate: string;
  giftCardTemplate: string;
  /** Optional link when a storefront Product is generated from this listing. */
  linkedProductId?: mongoose.Types.ObjectId | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const giftCardProductSchema = new Schema<IGiftCardProduct & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters'],
      minLength: [2, 'Title must be at least 2 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxLength: [5000, 'Description cannot exceed 5000 characters'],
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    denominations: {
      type: [Number],
      required: [true, 'At least one denomination is required'],
      validate: {
        validator(value: number[]) {
          return Array.isArray(value) && value.length > 0 && value.every((amount) => amount > 0);
        },
        message: 'Denominations must include at least one positive amount',
      },
    },
    storeCurrencyCode: {
      type: String,
      trim: true,
      default: 'INR',
      maxLength: [8, 'Currency code cannot exceed 8 characters'],
    },
    redemptionScope: {
      type: String,
      enum: ['all_currencies', 'store_currency'],
      default: 'all_currencies',
    },
    status: {
      type: String,
      enum: ['active', 'draft'],
      default: 'draft',
    },
    pageTitle: {
      type: String,
      trim: true,
      default: '',
      maxLength: [70, 'Page title cannot exceed 70 characters'],
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
      maxLength: [320, 'Meta description cannot exceed 320 characters'],
    },
    urlHandle: {
      type: String,
      trim: true,
      default: '',
      maxLength: [200, 'URL handle cannot exceed 200 characters'],
    },
    productType: {
      type: Schema.Types.ObjectId,
      ref: 'ProductType',
      default: null,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
    tagIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'ProductTag' }],
      default: [],
    },
    themeTemplate: {
      type: String,
      trim: true,
      default: 'default-product',
      maxLength: [100, 'Theme template cannot exceed 100 characters'],
    },
    giftCardTemplate: {
      type: String,
      trim: true,
      default: 'gift_card',
      maxLength: [100, 'Gift card template cannot exceed 100 characters'],
    },
    linkedProductId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

giftCardProductSchema.index({ storeId: 1, isDeleted: 1, createdAt: -1 });
giftCardProductSchema.index({ storeId: 1, urlHandle: 1 }, { unique: true, partialFilterExpression: { isDeleted: false, urlHandle: { $type: 'string', $ne: '' } } });

export const GiftCardProduct: Model<IGiftCardProduct & Document> = mongoose.model<
  IGiftCardProduct & Document
>('GiftCardProduct', giftCardProductSchema);
