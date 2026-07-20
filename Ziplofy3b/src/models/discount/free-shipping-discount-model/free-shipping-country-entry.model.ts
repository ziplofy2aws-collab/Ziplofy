import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFreeShippingCountryEntry {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  discountId: mongoose.Types.ObjectId; // FreeShippingDiscount
  countryId: mongoose.Types.ObjectId; // Country
  createdAt: Date;
  updatedAt: Date;
}

const freeShippingCountryEntrySchema = new Schema<IFreeShippingCountryEntry & Document>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  discountId: { type: Schema.Types.ObjectId, ref: 'FreeShippingDiscount', required: true, index: true },
  countryId: { type: Schema.Types.ObjectId, ref: 'Country', required: true, index: true },
}, { timestamps: true, versionKey: false });

freeShippingCountryEntrySchema.index({ storeId: 1, discountId: 1 });

export const FreeShippingCountryEntry: Model<IFreeShippingCountryEntry & Document> =
  mongoose.models.FreeShippingCountryEntry || mongoose.model<IFreeShippingCountryEntry & Document>('FreeShippingCountryEntry', freeShippingCountryEntrySchema);
