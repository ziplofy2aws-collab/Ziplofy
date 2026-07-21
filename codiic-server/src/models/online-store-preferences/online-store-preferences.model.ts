import mongoose, { Document, Model, Schema } from 'mongoose';

/** Max lengths aligned with Online Store → Preferences UI. */
export const ONLINE_STORE_PREFERENCES_LIMITS = {
  storefrontPassword: 100,
  messageToYourVisitors: 5000,
  seoHomePageTitle: 70,
  seoMetaDescription: 320,
} as const;

export interface IOnlineStorePreferences extends Document {
  storeId: mongoose.Types.ObjectId;

  /** Store access — password protection */
  passwordProtectionEnabled: boolean;
  /** Plaintext storefront password (hash at the API layer before persisting if required). */
  storefrontPassword?: string;
  messageToYourVisitors?: string;

  /** Store access — restrict storefront to logged-in B2B customers */
  b2bCustomersOnly: boolean;

  /** Social sharing image and SEO */
  seoHomePageTitle?: string;
  seoMetaDescription?: string;
  seoSocialImageUrl?: string;

  /** Automatic redirection */
  countryRedirectionEnabled: boolean;
  languageRedirectionEnabled: boolean;

  /** Spam protection (hCaptcha) */
  spamContactFormsEnabled: boolean;
  spamAuthPagesEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const onlineStorePreferencesSchema = new Schema<IOnlineStorePreferences>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true,
      index: true,
    },
    passwordProtectionEnabled: {
      type: Boolean,
      default: false,
    },
    storefrontPassword: {
      type: String,
      trim: true,
      maxLength: [ONLINE_STORE_PREFERENCES_LIMITS.storefrontPassword, 'Storefront password cannot exceed 100 characters'],
      default: undefined,
    },
    messageToYourVisitors: {
      type: String,
      trim: true,
      maxLength: [
        ONLINE_STORE_PREFERENCES_LIMITS.messageToYourVisitors,
        'Message to visitors cannot exceed 5000 characters',
      ],
      default: undefined,
    },
    b2bCustomersOnly: {
      type: Boolean,
      default: false,
    },
    seoHomePageTitle: {
      type: String,
      trim: true,
      maxLength: [
        ONLINE_STORE_PREFERENCES_LIMITS.seoHomePageTitle,
        'SEO home page title cannot exceed 70 characters',
      ],
      default: '',
    },
    seoMetaDescription: {
      type: String,
      trim: true,
      maxLength: [
        ONLINE_STORE_PREFERENCES_LIMITS.seoMetaDescription,
        'SEO meta description cannot exceed 320 characters',
      ],
      default: '',
    },
    seoSocialImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    countryRedirectionEnabled: {
      type: Boolean,
      default: true,
    },
    languageRedirectionEnabled: {
      type: Boolean,
      default: false,
    },
    spamContactFormsEnabled: {
      type: Boolean,
      default: true,
    },
    spamAuthPagesEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

onlineStorePreferencesSchema.index({ storeId: 1 });

export const OnlineStorePreferences: Model<IOnlineStorePreferences> =
  mongoose.models.OnlineStorePreferences ||
  mongoose.model<IOnlineStorePreferences>('OnlineStorePreferences', onlineStorePreferencesSchema);
