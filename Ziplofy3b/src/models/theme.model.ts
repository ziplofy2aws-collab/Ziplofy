import mongoose, { Document, Model, Schema } from "mongoose";

// Theme Category Types
export type ThemeCategory = "travel" | "business" | "portfolio" | "ecommerce" | "blog" | "education" | "health" | "food";

// Theme Plan Types
export type ThemePlan = "free" | "basic" | "premium" | "enterprise";

const s3AssetPartSchema = new Schema(
  {
    key: { type: String, required: true },
    url: { type: String, required: true },
    contentType: { type: String },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const contentRootSchema = new Schema(
  {
    prefix: { type: String, required: true },
    fileCount: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

export interface ThemeCatalogS3AssetsDoc {
  /** Catalog prefix for multi-file static themes (mutually exclusive with `zip`). */
  contentRoot?: {
    prefix: string;
    fileCount: number;
    uploadedAt?: Date;
  };
  zip?: {
    key: string;
    url: string;
    contentType?: string;
    size?: number;
    uploadedAt?: Date;
  };
  thumbnail?: {
    key: string;
    url: string;
    contentType?: string;
    size?: number;
    uploadedAt?: Date;
  };
  reactThemeJs?: {
    key: string;
    url: string;
    contentType?: string;
    size?: number;
    uploadedAt?: Date;
  };
  reactThemeCss?: {
    key: string;
    url: string;
    contentType?: string;
    size?: number;
    uploadedAt?: Date;
  };
  reactThemeSchema?: {
    key: string;
    url: string;
    contentType?: string;
    size?: number;
    uploadedAt?: Date;
  };
  reactThemeDefaultConfig?: {
    key: string;
    url: string;
    contentType?: string;
    size?: number;
    uploadedAt?: Date;
  };
  reactThemeManifest?: {
    key: string;
    url: string;
    contentType?: string;
    size?: number;
    uploadedAt?: Date;
  };
}

export interface ITheme extends Document {
  name: string;
  description?: string;
  category: ThemeCategory;
  plan: ThemePlan;
  price?: number;
  /** Stable slug used in URLs and installs (not a filesystem path). */
  themePath: string;
  s3Assets: ThemeCatalogS3AssetsDoc;
  version?: string;
  tags?: string[];
  isActive?: boolean;
  downloads?: number;
  installationCount?: number;
  rating?: {
    average?: number;
    count?: number;
  };
  uploadBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ThemeSchema: Schema<ITheme> = new Schema<ITheme>({
  name: {
    type: String,
    required: [true, "Theme name is required"],
    trim: true,
    maxLength: [100, "Theme name cannot exceed 100 characters"],
  },
  description: {
    type: String,
    maxLength: [500, "Description cannot exceed 500 characters"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: ["travel", "business", "portfolio", "ecommerce", "blog", "education", "health", "food"],
  },
  plan: {
    type: String,
    required: [true, "Plan is required"],
    enum: ["free", "basic", "premium", "enterprise"],
  },
  price: {
    type: Number,
    default: 0,
  },
  themePath: {
    type: String,
    required: true,
    unique: true,
  },
  s3Assets: {
    type: new Schema(
      {
        contentRoot: { type: contentRootSchema, required: false },
        zip: { type: s3AssetPartSchema, required: false },
        thumbnail: { type: s3AssetPartSchema, required: false },
        reactThemeJs: { type: s3AssetPartSchema, required: false },
        reactThemeCss: { type: s3AssetPartSchema, required: false },
        reactThemeSchema: { type: s3AssetPartSchema, required: false },
        reactThemeDefaultConfig: { type: s3AssetPartSchema, required: false },
        reactThemeManifest: { type: s3AssetPartSchema, required: false },
      },
      { _id: false }
    ),
    required: true,
    validate: {
      validator(v: ThemeCatalogS3AssetsDoc | undefined) {
        if (!v) return false;
        const hasZip = Boolean(v.zip?.key);
        const hasFolder = Boolean(v.contentRoot?.prefix);
        return hasZip !== hasFolder;
      },
      message: "s3Assets must have exactly one of: zip (legacy) or contentRoot (folder upload)",
    },
  },
  version: {
    type: String,
    default: "1.0.0",
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  installationCount: {
    type: Number,
    default: 0,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  uploadBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp before saving
ThemeSchema.pre<ITheme>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for search functionality
ThemeSchema.index({ name: "text", description: "text", tags: "text" });

export const Theme: Model<ITheme> = mongoose.models.Theme || mongoose.model<ITheme>("Theme", ThemeSchema);
