// @ts-nocheck
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStoreInvite extends Document {
  storeId: mongoose.Types.ObjectId;
  inviterId: mongoose.Types.ObjectId;
  inviterEmail: string;
  inviteeEmail: string;
  roleId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const storeInviteSchema = new Schema<IStoreInvite>(
  {
    storeId: { type: mongoose.Types.ObjectId, ref: 'Store', required: true },
    inviterId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    inviterEmail: { type: String, required: true, trim: true },
    inviteeEmail: { type: String, required: true, trim: true, index: true },
    roleId: { type: mongoose.Types.ObjectId, ref: 'Role', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    token: { type: String, required: true, unique: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  },
  { timestamps: true, versionKey: false }
);

storeInviteSchema.index({ storeId: 1, inviteeEmail: 1 }, { unique: false });

export const StoreInvite: Model<IStoreInvite> = mongoose.model<IStoreInvite>(
  'StoreInvite',
  storeInviteSchema
);


