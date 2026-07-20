import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStoreRole extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  permissions: string[];
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storeRoleSchema = new Schema<IStoreRole>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: { type: [String], required: true, default: [] },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

storeRoleSchema.index({ storeId: 1, name: 1 }, { unique: true });

export const StoreRole: Model<IStoreRole> = mongoose.model<IStoreRole>(
  'StoreRole',
  storeRoleSchema
);


