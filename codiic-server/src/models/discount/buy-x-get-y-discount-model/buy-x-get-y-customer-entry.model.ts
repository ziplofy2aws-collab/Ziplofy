import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBuyXGetYCustomerEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // BuyXGetYDiscount
  customerId: mongoose.Types.ObjectId; // Customer
  createdAt: Date;
  updatedAt: Date;
}

const buyXGetYCustomerEntrySchema = new Schema<IBuyXGetYCustomerEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'BuyXGetYDiscount', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
}, { timestamps: true, versionKey: false });

buyXGetYCustomerEntrySchema.index({ storeId: 1, discountId: 1 });
buyXGetYCustomerEntrySchema.index({ discountId: 1, customerId: 1 });

export const BuyXGetYCustomerEntry: Model<IBuyXGetYCustomerEntry & Document> =
  mongoose.models.BuyXGetYCustomerEntry ||
  mongoose.model<IBuyXGetYCustomerEntry & Document>('BuyXGetYCustomerEntry', buyXGetYCustomerEntrySchema);
