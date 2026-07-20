import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFinalSaleItem extends Document {
  returnRulesId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  productVariantId?: mongoose.Types.ObjectId | null;
  collectionId?: mongoose.Types.ObjectId | null;
}

const finalSaleItemSchema = new Schema<IFinalSaleItem>(
  {
    returnRulesId: { type: Schema.Types.ObjectId, ref: 'ReturnRules', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    productVariantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collections', default: null },
  },
  { timestamps: true, versionKey: false }
);

// Ensure at least one of productVariantId or collectionId is present
finalSaleItemSchema.pre('validate', function (next) {
  const doc = this as IFinalSaleItem;
  if (!doc.productVariantId && !doc.collectionId) {
    return next(new Error('Either productVariantId or collectionId must be provided'));
  }
  next();
});

finalSaleItemSchema.index(
  { returnRulesId: 1, productVariantId: 1 },
  {
    unique: true,
    partialFilterExpression: { productVariantId: { $type: 'objectId' } },
  }
);

finalSaleItemSchema.index(
  { returnRulesId: 1, collectionId: 1 },
  {
    unique: true,
    partialFilterExpression: { collectionId: { $type: 'objectId' } },
  }
);

export const FinalSaleItem: Model<IFinalSaleItem> =
  mongoose.models.FinalSaleItem || mongoose.model<IFinalSaleItem>('FinalSaleItem', finalSaleItemSchema);


