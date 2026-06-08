import mongoose, { Document, Model, Schema } from 'mongoose';

// Interface for Google authentication provider
export interface IGoogleAuthProvider {
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
  authorizedJavaScriptOrigins?: string[];
  authorizedRedirectURIs?: string[];
  deauthorizeCallbackURIs?: string[];
  connectedAt?: Date;
  lastUpdatedAt?: Date;
}

// Interface for Facebook authentication provider
export interface IFacebookAuthProvider {
  enabled: boolean;
  appId?: string;
  appSecret?: string;
  domains?: string[];
  redirectURLs?: string[];
  deauthorizeCallbackURLs?: string[];
  connectedAt?: Date;
  lastUpdatedAt?: Date;
}

// Interface for Shop authentication provider
export interface IShopAuthProvider {
  enabled: boolean;
  lastUpdatedAt?: Date;
}

// Main interface for Customer Account Settings
export interface ICustomerAccountSettings extends Document {
  storeId: mongoose.Types.ObjectId;
  
  // Sign-in links configuration
  showSignInLinks: boolean;
  
  // Account version preference
  accountVersion: 'recommended' | 'legacy';
  
  // Customer account features
  selfServeReturns: boolean;
  storeCredit: boolean;
  
  // Authentication providers
  shopAuth: IShopAuthProvider;
  googleAuth: IGoogleAuthProvider;
  facebookAuth: IFacebookAuthProvider;
  
  // Customer account URL (if custom)
  customAccountUrl?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Sub-schema for Google authentication provider
const googleAuthProviderSchema = new Schema<IGoogleAuthProvider>(
  {
    enabled: {
      type: Boolean,
      default: false,
      required: true,
    },
    clientId: {
      type: String,
      trim: true,
      default: undefined,
    },
    clientSecret: {
      type: String,
      trim: true,
      default: undefined,
      select: false, // Don't include in default queries for security
    },
    authorizedJavaScriptOrigins: {
      type: [String],
      default: [],
    },
    authorizedRedirectURIs: {
      type: [String],
      default: [],
    },
    deauthorizeCallbackURIs: {
      type: [String],
      default: [],
    },
    connectedAt: {
      type: Date,
      default: undefined,
    },
    lastUpdatedAt: {
      type: Date,
      default: undefined,
    },
  },
  { _id: false }
);

// Sub-schema for Facebook authentication provider
const facebookAuthProviderSchema = new Schema<IFacebookAuthProvider>(
  {
    enabled: {
      type: Boolean,
      default: false,
      required: true,
    },
    appId: {
      type: String,
      trim: true,
      default: undefined,
    },
    appSecret: {
      type: String,
      trim: true,
      default: undefined,
      select: false, // Don't include in default queries for security
    },
    domains: {
      type: [String],
      default: [],
    },
    redirectURLs: {
      type: [String],
      default: [],
    },
    deauthorizeCallbackURLs: {
      type: [String],
      default: [],
    },
    connectedAt: {
      type: Date,
      default: undefined,
    },
    lastUpdatedAt: {
      type: Date,
      default: undefined,
    },
  },
  { _id: false }
);

// Sub-schema for Shop authentication provider
const shopAuthProviderSchema = new Schema<IShopAuthProvider>(
  {
    enabled: {
      type: Boolean,
      default: true, // Shop auth is enabled by default
      required: true,
    },
    lastUpdatedAt: {
      type: Date,
      default: undefined,
    },
  },
  { _id: false }
);

// Main schema for Customer Account Settings
const customerAccountSettingsSchema = new Schema<ICustomerAccountSettings>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      unique: true, // One settings document per store
      index: true,
    },
    
    // Sign-in links configuration
    showSignInLinks: {
      type: Boolean,
      default: false,
      required: true,
    },
    
    // Account version preference
    accountVersion: {
      type: String,
      enum: ['recommended', 'legacy'],
      default: 'recommended',
      required: true,
    },
    
    // Customer account features
    selfServeReturns: {
      type: Boolean,
      default: false,
      required: true,
    },
    storeCredit: {
      type: Boolean,
      default: false,
      required: true,
    },
    
    // Authentication providers
    shopAuth: {
      type: shopAuthProviderSchema,
      required: true,
      default: () => ({ enabled: true }),
    },
    googleAuth: {
      type: googleAuthProviderSchema,
      required: true,
      default: () => ({ enabled: false }),
    },
    facebookAuth: {
      type: facebookAuthProviderSchema,
      required: true,
      default: () => ({ enabled: false }),
    },
    
    // Custom account URL (optional)
    customAccountUrl: {
      type: String,
      trim: true,
      default: undefined,
      validate: {
        validator: function(v: string | undefined) {
          if (!v) return true; // Optional field
          // Basic URL validation
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: 'customAccountUrl must be a valid URL',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for efficient queries
customerAccountSettingsSchema.index({ storeId: 1 }, { unique: true });
customerAccountSettingsSchema.index({ 'googleAuth.enabled': 1 });
customerAccountSettingsSchema.index({ 'facebookAuth.enabled': 1 });
customerAccountSettingsSchema.index({ showSignInLinks: 1 });

// Pre-save middleware to update lastUpdatedAt for auth providers when they change
customerAccountSettingsSchema.pre('save', function (next) {
  const doc = this as ICustomerAccountSettings;
  const now = new Date();
  
  // Update lastUpdatedAt for auth providers if they're being modified
  if (this.isModified('shopAuth.enabled')) {
    doc.shopAuth.lastUpdatedAt = now;
  }
  if (this.isModified('googleAuth.enabled') || this.isModified('googleAuth.clientId') || this.isModified('googleAuth.clientSecret')) {
    doc.googleAuth.lastUpdatedAt = now;
    if (doc.googleAuth.enabled && doc.googleAuth.clientId && !doc.googleAuth.connectedAt) {
      doc.googleAuth.connectedAt = now;
    }
  }
  if (this.isModified('facebookAuth.enabled') || this.isModified('facebookAuth.appId') || this.isModified('facebookAuth.appSecret')) {
    doc.facebookAuth.lastUpdatedAt = now;
    if (doc.facebookAuth.enabled && doc.facebookAuth.appId && !doc.facebookAuth.connectedAt) {
      doc.facebookAuth.connectedAt = now;
    }
  }
  
  next();
});

// Method to get account URL (custom or default)
customerAccountSettingsSchema.methods.getAccountUrl = function (baseDomain?: string): string {
  if (this.customAccountUrl) {
    return this.customAccountUrl;
  }
  // Default URL format
  return baseDomain ? `${baseDomain}/account` : 'https://ziplofy.com/your-store/account';
};

// Static method to find or create settings for a store
customerAccountSettingsSchema.statics.findOrCreate = async function (storeId: mongoose.Types.ObjectId) {
  let settings = await this.findOne({ storeId });
  
  if (!settings) {
    settings = await this.create({
      storeId,
      showSignInLinks: false,
      accountVersion: 'recommended',
      selfServeReturns: false,
      storeCredit: false,
      shopAuth: { enabled: true },
      googleAuth: { enabled: false },
      facebookAuth: { enabled: false },
    });
  }
  
  return settings;
};

export const CustomerAccountSettings: Model<ICustomerAccountSettings> = mongoose.model<ICustomerAccountSettings>(
  'CustomerAccountSettings',
  customerAccountSettingsSchema
);

