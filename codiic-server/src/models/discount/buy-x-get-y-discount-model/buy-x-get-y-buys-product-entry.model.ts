import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBuyXGetYBuysProductEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // BuyXGetYDiscount
  productId: mongoose.Types.ObjectId; // Product
  createdAt: Date;
  updatedAt: Date;
}

const buyXGetYBuysProductEntrySchema = new Schema<IBuyXGetYBuysProductEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'BuyXGetYDiscount', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
}, { timestamps: true, versionKey: false });

buyXGetYBuysProductEntrySchema.index({ storeId: 1, discountId: 1 });
buyXGetYBuysProductEntrySchema.index({ discountId: 1, productId: 1 });

export const BuyXGetYBuysProductEntry: Model<IBuyXGetYBuysProductEntry & Document> =
  mongoose.models.BuyXGetYBuysProductEntry ||
  mongoose.model<IBuyXGetYBuysProductEntry & Document>('BuyXGetYBuysProductEntry', buyXGetYBuysProductEntrySchema);
