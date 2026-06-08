import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICustomTheme extends Document {
  name: string;
  html?: string; // Optional - stored on disk, not in DB for large themes
  css?: string; // Optional - stored on disk, not in DB for large themes
  themePath: string;
  directories: {
    theme: string;
    thumbnail: string;
    unzippedTheme: string;
  };
  thumbnail?: {
    filename?: string;
    originalName?: string;
    path?: string;
    size?: number;
    uploadDate?: Date;
  };
  createdBy: mongoose.Types.ObjectId;
  status?: 'draft' | 'published';
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomThemeSchema: Schema<ICustomTheme> = new Schema<ICustomTheme>(
  {
    name: {
      type: String,
      required: [true, "Theme name is required"],
      trim: true,
      maxLength: [100, "Theme name cannot exceed 100 characters"],
    },
    html: {
      type: String,
      required: false, // Not required - stored on disk for large themes
    },
    css: {
      type: String,
      required: false, // Not required - stored on disk for large themes
      default: "",
    },
    themePath: {
      type: String,
      required: true,
      unique: true,
    },
    directories: {
      theme: { type: String, required: true },
      thumbnail: { type: String, required: true },
      unzippedTheme: { type: String, required: true },
    },
    thumbnail: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

// Index for faster queries
CustomThemeSchema.index({ createdBy: 1, createdAt: -1 });
CustomThemeSchema.index({ themePath: 1 });

export const CustomTheme: Model<ICustomTheme> = mongoose.model<ICustomTheme>(
  "CustomTheme",
  CustomThemeSchema
);

