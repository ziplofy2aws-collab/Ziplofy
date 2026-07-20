import mongoose, { Document, Schema } from 'mongoose';

export interface ISubdomain extends Document {
  storeId: mongoose.Types.ObjectId;
  subdomain: string;
  customDomain?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const subdomainSchema = new Schema<ISubdomain>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true,
    unique: true, // one mapping per store
  },
  subdomain: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  },
  customDomain: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    unique: true,
  },
}, {
  timestamps: true,
  collection: 'storesubdomains',
});

export const Subdomain = mongoose.model<ISubdomain>('Subdomain', subdomainSchema);

