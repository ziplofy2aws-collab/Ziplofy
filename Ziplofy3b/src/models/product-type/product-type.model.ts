import mongoose, { Document, Schema } from 'mongoose';

export interface IProductType {
  _id: string;
  storeId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductTypeSchema = new Schema<IProductType>({
  storeId: {
    type: String,
    required: true,
    ref: 'Store'
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

export const ProductType = mongoose.model<IProductType>('ProductType', ProductTypeSchema);
