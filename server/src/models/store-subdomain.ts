import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStoreSubdomain {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  subdomain: string;
  customDomain?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const storeSubdomainSchema = new Schema<IStoreSubdomain & Document>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true,
    unique: true, // one subdomain mapping per store
  },
  subdomain: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true, // subdomain must be globally unique
    index: true,
  },
  customDomain: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true, // allow multiple null/undefined values while keeping uniqueness when set
    index: true,
    default: null,
  },
}, { timestamps: true });

export const StoreSubdomain: Model<IStoreSubdomain & Document> = mongoose.model<IStoreSubdomain & Document>('StoreSubdomain', storeSubdomainSchema);


