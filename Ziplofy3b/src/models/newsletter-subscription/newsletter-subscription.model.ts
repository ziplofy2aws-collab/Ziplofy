import mongoose, { Document, Model, Schema } from "mongoose";

export const NEWSLETTER_SUBSCRIPTION_STATUS = ["subscribed", "unsubscribed"] as const;
export type NewsletterSubscriptionStatus = (typeof NEWSLETTER_SUBSCRIPTION_STATUS)[number];

export interface INewsletterSubscription {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  email: string;
  status: NewsletterSubscriptionStatus;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSubscriptionSchema = new Schema<INewsletterSubscription & Document>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxLength: [255, "Email cannot exceed 255 characters"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    status: {
      type: String,
      enum: NEWSLETTER_SUBSCRIPTION_STATUS,
      default: "subscribed",
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/** One subscription record per email per store (re-subscribe by flipping status). */
newsletterSubscriptionSchema.index({ storeId: 1, email: 1 }, { unique: true });
newsletterSubscriptionSchema.index({ storeId: 1, status: 1, createdAt: -1 });
newsletterSubscriptionSchema.index({ storeId: 1, createdAt: -1 });

export const NewsletterSubscription: Model<INewsletterSubscription & Document> =
  mongoose.models.NewsletterSubscription ||
  mongoose.model<INewsletterSubscription & Document>(
    "NewsletterSubscription",
    newsletterSubscriptionSchema
  );
