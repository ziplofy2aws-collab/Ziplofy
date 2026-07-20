import mongoose, { Document, Model, Schema } from "mongoose";

export interface IInstalledThemes extends Document {
  store: mongoose.Types.ObjectId;
  theme: mongoose.Types.ObjectId;
  installedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  /** Set when the store removes the theme; row kept for history. */
  uninstalledAt?: Date | null;
}

const InstalledThemesSchema: Schema<IInstalledThemes> = new Schema<IInstalledThemes>(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    theme: {
      type: Schema.Types.ObjectId,
      ref: "Theme",
      required: true,
      index: true,
    },
    installedAt: {
      type: Date,
      default: null,
    },
    uninstalledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

// Ensure one installation record per (store, theme)
InstalledThemesSchema.index({ store: 1, theme: 1 }, { unique: true });

// Helpful secondary indexes
InstalledThemesSchema.index({ store: 1, theme: 1, createdAt: -1 });
InstalledThemesSchema.index({ theme: 1, installedAt: -1 });

export const InstalledThemes: Model<IInstalledThemes> =
  mongoose.models.InstalledThemes ||
  mongoose.model<IInstalledThemes>("InstalledThemes", InstalledThemesSchema);
