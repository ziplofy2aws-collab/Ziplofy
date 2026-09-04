import mongoose, { Document, Model, Schema } from 'mongoose';

export type InformaticThemePlan = 'free' | 'basic' | 'premium' | 'enterprise';

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

export interface InformaticThemeS3AssetsDoc {
  contentRoot?: {
    prefix: string;
    fileCount: number;
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

export interface IInformaticTheme extends Document {
  name: string;
  description?: string;
  slug: string;
  plan: InformaticThemePlan;
  price?: number;
  version?: string;
  tags?: string[];
  isActive?: boolean;
  isDefault?: boolean;
  manifestSummary?: {
    themeId?: string;
    templates?: string[];
    type?: string;
  };
  s3Assets: InformaticThemeS3AssetsDoc;
  uploadBy: mongoose.Types.ObjectId;
  installationCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const InformaticThemeSchema = new Schema<IInformaticTheme>(
  {
    name: {
      type: String,
      required: [true, 'Theme name is required'],
      trim: true,
      maxLength: [100, 'Theme name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxLength: [500, 'Description cannot exceed 500 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    plan: {
      type: String,
      required: true,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    price: { type: Number, default: 0 },
    version: { type: String, default: '1.0.0' },
    tags: [String],
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    manifestSummary: {
      themeId: String,
      templates: [String],
      type: { type: String, default: 'react-remote' },
    },
    s3Assets: {
      type: new Schema(
        {
          contentRoot: { type: contentRootSchema, required: false },
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
    },
    uploadBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    installationCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'informatic_themes' }
);

InformaticThemeSchema.index({ name: 'text', description: 'text', tags: 'text' });
InformaticThemeSchema.index({ isActive: 1, createdAt: -1 });

export const InformaticTheme: Model<IInformaticTheme> =
  mongoose.models.InformaticTheme ||
  mongoose.model<IInformaticTheme>('InformaticTheme', InformaticThemeSchema);
