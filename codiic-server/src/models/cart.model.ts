import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICart {
  storeId: mongoose.Types.ObjectId;
  productVariantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ICartDocument = ICart & Document;

const cartSchema = new Schema<ICartDocument>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    productVariantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { timestamps: true }
);

// Ensure one cart line per customer per product variant
cartSchema.index({ customerId: 1, productVariantId: 1 }, { unique: true });

export const Cart: Model<ICartDocument> = mongoose.model<ICartDocument>('Cart', cartSchema);


