import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreBanner extends Document {
  storeId: mongoose.Types.ObjectId;
  /** Logical name for this banner set (e.g. home-hero, promo-strip). */
  bannerGroupName: string;
  /** Absolute or CDN URLs for banner images, in display order. */
  imageUrls: string[];
}

const storeBannerSchema = new Schema<IStoreBanner>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    bannerGroupName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Banner group name cannot exceed 200 characters'],
    },
    imageUrls: {
      type: [String],
      default: [],
      validate: {
        validator(urls: string[]) {
          if (!urls?.length) return true;
          return urls.every((u) => typeof u === 'string' && u.trim().length > 0);
        },
        message: 'Each image URL must be a non-empty string',
      },
    },
  },
  { timestamps: true, versionKey: false }
);

storeBannerSchema.index({ storeId: 1, bannerGroupName: 1 }, { unique: true });
storeBannerSchema.index({ storeId: 1, createdAt: -1 });

export const StoreBanner: Model<IStoreBanner> =
  mongoose.models.StoreBanner || mongoose.model<IStoreBanner>('StoreBanner', storeBannerSchema);
