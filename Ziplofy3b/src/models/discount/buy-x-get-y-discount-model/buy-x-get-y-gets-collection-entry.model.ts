import mongoose, { Document, Model, Schema } from 'mongoose';

export type BuyXGetYGetsDiscountedValue = 'free' | 'amount' | 'percentage';

export interface IBuyXGetYGetsCollectionEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // BuyXGetYDiscount
  collectionId: mongoose.Types.ObjectId; // Collection

  // At a discounted value
  discountedValue: BuyXGetYGetsDiscountedValue; // free | amount | percentage
  discountedAmount?: number; // when discountedValue = amount
  discountedPercentage?: number; // when discountedValue = percentage

  // Maximum uses per order
  setMaxUsesPerOrder?: boolean;
  maxUsesPerOrder?: number;

  createdAt: Date;
  updatedAt: Date;
}

const buyXGetYGetsCollectionEntrySchema = new Schema<IBuyXGetYGetsCollectionEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'BuyXGetYDiscount', required: true, index: true },
  collectionId: { type: Schema.Types.ObjectId, ref: 'Collections', required: true, index: true },

  // At a discounted value
  discountedValue: { type: String, enum: ['free', 'amount', 'percentage'], required: true },
  discountedAmount: { type: Number, min: 0 },
  discountedPercentage: { type: Number, min: 0, max: 100 },

  // Maximum uses per order
  setMaxUsesPerOrder: { type: Boolean, default: false },
  maxUsesPerOrder: { type: Number, min: 1 },
}, { timestamps: true, versionKey: false });

// Validation for conditional fields
buyXGetYGetsCollectionEntrySchema.pre('validate', function(next) {
  const doc = this as unknown as IBuyXGetYGetsCollectionEntry & Document;
  if (doc.discountedValue === 'amount' && (doc.discountedAmount === undefined || doc.discountedAmount === null)) {
    return next(new Error('discountedAmount is required when discountedValue is amount'));
  }
  if (doc.discountedValue === 'percentage' && (doc.discountedPercentage === undefined || doc.discountedPercentage === null)) {
    return next(new Error('discountedPercentage is required when discountedValue is percentage'));
  }
  if (doc.setMaxUsesPerOrder && (doc.maxUsesPerOrder === undefined || doc.maxUsesPerOrder === null)) {
    return next(new Error('maxUsesPerOrder is required when setMaxUsesPerOrder is true'));
  }
  next();
});

buyXGetYGetsCollectionEntrySchema.index({ storeId: 1, discountId: 1 });
buyXGetYGetsCollectionEntrySchema.index({ discountId: 1, collectionId: 1 });

export const BuyXGetYGetsCollectionEntry: Model<IBuyXGetYGetsCollectionEntry & Document> =
  mongoose.models.BuyXGetYGetsCollectionEntry ||
  mongoose.model<IBuyXGetYGetsCollectionEntry & Document>('BuyXGetYGetsCollectionEntry', buyXGetYGetsCollectionEntrySchema);
