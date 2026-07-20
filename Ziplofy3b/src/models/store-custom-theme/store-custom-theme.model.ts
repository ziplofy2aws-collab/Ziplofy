import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * JSON-driven theme builder config for a store (System 2 — builder themes).
 * One document = one saved custom theme layout for that store.
 */
export interface IStoreCustomTheme extends Document {
  storeId: mongoose.Types.ObjectId;
  /** Display name in admin (e.g. "Summer launch"). Required — provided by the merchant. */
  themeName: string;
  /** Optional short description for the theme in admin. */
  themeDesc?: string;
  /** Full theme document: sections, layout_order, templates, settings, etc. */
  themeConfig: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const storeCustomThemeSchema = new Schema<IStoreCustomTheme>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true,
    },
    themeName: {
      type: String,
      required: [true, 'Theme name is required'],
      trim: true,
      maxlength: [120, 'Theme name cannot exceed 120 characters'],
    },
    themeDesc: {
      type: String,
      trim: true,
      maxlength: [500, 'Theme description cannot exceed 500 characters'],
    },
    themeConfig: {
      type: Schema.Types.Mixed,
      required: [true, 'Theme config is required'],
      default: () => ({}),
    },
  },
  { timestamps: true, versionKey: false }
);

storeCustomThemeSchema.index({ storeId: 1, createdAt: -1 });
storeCustomThemeSchema.index({ storeId: 1, themeName: 1 });

export const StoreCustomTheme: Model<IStoreCustomTheme> =
  mongoose.models.StoreCustomTheme ||
  mongoose.model<IStoreCustomTheme>('StoreCustomTheme', storeCustomThemeSchema);
