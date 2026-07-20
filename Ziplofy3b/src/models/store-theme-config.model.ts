import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStoreThemeConfig extends Document {
  store: mongoose.Types.ObjectId;
  theme: mongoose.Types.ObjectId;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const storeThemeConfigSchema = new Schema<IStoreThemeConfig>(
  {
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    theme: { type: Schema.Types.ObjectId, ref: 'Theme', required: true, index: true },
    config: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  { timestamps: true, versionKey: false }
);

storeThemeConfigSchema.index({ store: 1, theme: 1 }, { unique: true });

export const StoreThemeConfig: Model<IStoreThemeConfig> = mongoose.model<IStoreThemeConfig>(
  'StoreThemeConfig',
  storeThemeConfigSchema
);
