import mongoose, { Document, Schema } from 'mongoose';

export type StoreDomainType = 'connected';
export type StoreDomainStatus = 'pending' | 'verifying' | 'active' | 'failed';
export type StoreDomainSslStatus =
  | 'not_configured'
  | 'pending'
  | 'active'
  | 'error'
  | 'deleted';

export interface IDnsInstruction {
  type: 'CNAME' | 'ALIAS' | 'A' | 'TXT';
  host: string;
  value: string;
  purpose: string;
}

export interface IStoreDomain extends Document {
  storeId: mongoose.Types.ObjectId;
  hostname: string;
  type: StoreDomainType;
  status: StoreDomainStatus;
  isPrimary: boolean;
  verificationToken: string;
  dnsInstructions: IDnsInstruction[];
  cloudflareCustomHostnameId?: string | null;
  sslStatus?: StoreDomainSslStatus;
  sslError?: string | null;
  verifiedAt?: Date | null;
  lastError?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const dnsInstructionSchema = new Schema<IDnsInstruction>(
  {
    type: { type: String, enum: ['CNAME', 'ALIAS', 'A', 'TXT'], required: true },
    host: { type: String, required: true },
    value: { type: String, required: true },
    purpose: { type: String, required: true },
  },
  { _id: false }
);

const storeDomainSchema = new Schema<IStoreDomain>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    hostname: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['connected'],
      default: 'connected',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verifying', 'active', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: true,
    },
    dnsInstructions: {
      type: [dnsInstructionSchema],
      default: [],
    },
    cloudflareCustomHostnameId: {
      type: String,
      default: null,
      index: true,
    },
    sslStatus: {
      type: String,
      enum: ['not_configured', 'pending', 'active', 'error', 'deleted'],
      default: 'not_configured',
      index: true,
    },
    sslError: {
      type: String,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'storedomains',
  }
);

storeDomainSchema.index({ storeId: 1, status: 1 });

export const StoreDomain = mongoose.model<IStoreDomain>('StoreDomain', storeDomainSchema);
