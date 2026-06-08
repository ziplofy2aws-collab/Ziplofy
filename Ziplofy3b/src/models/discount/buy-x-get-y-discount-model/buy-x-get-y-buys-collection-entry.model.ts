import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBuyXGetYBuysCollectionEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // BuyXGetYDiscount
  collectionId: mongoose.Types.ObjectId; // Collection
  createdAt: Date;
  updatedAt: Date;
}

const buyXGetYBuysCollectionEntrySchema = new Schema<IBuyXGetYBuysCollectionEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'BuyXGetYDiscount', required: true, index: true },
  collectionId: { type: Schema.Types.ObjectId, ref: 'Collections', required: true, index: true },
}, { timestamps: true, versionKey: false });

buyXGetYBuysCollectionEntrySchema.index({ storeId: 1, discountId: 1 });
buyXGetYBuysCollectionEntrySchema.index({ discountId: 1, collectionId: 1 });

export const BuyXGetYBuysCollectionEntry: Model<IBuyXGetYBuysCollectionEntry & Document> =
  mongoose.models.BuyXGetYBuysCollectionEntry ||
  mongoose.model<IBuyXGetYBuysCollectionEntry & Document>('BuyXGetYBuysCollectionEntry', buyXGetYBuysCollectionEntrySchema);
