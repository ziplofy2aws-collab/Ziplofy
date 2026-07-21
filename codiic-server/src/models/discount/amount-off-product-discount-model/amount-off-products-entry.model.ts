import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAmountOffProductsEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // AmountOffProductsDiscount
  productId?: mongoose.Types.ObjectId | null;   // for appliesTo: specific-products
  collectionId?: mongoose.Types.ObjectId | null; // for appliesTo: specific-collections
  createdAt: Date;
  updatedAt: Date;
}

const amountOffProductsEntrySchema = new Schema<IAmountOffProductsEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'AmountOffProductsDiscount', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
  collectionId: { type: Schema.Types.ObjectId, ref: 'Collections', default: null, index: true },
}, { timestamps: true, versionKey: false });

amountOffProductsEntrySchema.index({ storeId: 1, discountId: 1 });
amountOffProductsEntrySchema.index({ storeId: 1, productId: 1 });
amountOffProductsEntrySchema.index({ storeId: 1, collectionId: 1 });

const AmountOffProductsEntry: Model<IAmountOffProductsEntry & Document> =
  mongoose.models.AmountOffProductsEntry ||
  mongoose.model<IAmountOffProductsEntry & Document>(
    'AmountOffProductsEntry',
    amountOffProductsEntrySchema
  );

export { AmountOffProductsEntry };
