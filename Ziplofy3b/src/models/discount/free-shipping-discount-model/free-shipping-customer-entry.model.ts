import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFreeShippingCustomerEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // FreeShippingDiscount
  customerId: mongoose.Types.ObjectId; // Customer
  createdAt: Date;
  updatedAt: Date;
}

const freeShippingCustomerEntrySchema = new Schema<IFreeShippingCustomerEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'FreeShippingDiscount', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
}, { timestamps: true, versionKey: false });

freeShippingCustomerEntrySchema.index({ storeId: 1, discountId: 1 });

export const FreeShippingCustomerEntry: Model<IFreeShippingCustomerEntry & Document> =
  mongoose.models.FreeShippingCustomerEntry || mongoose.model<IFreeShippingCustomerEntry & Document>('FreeShippingCustomerEntry', freeShippingCustomerEntrySchema);
