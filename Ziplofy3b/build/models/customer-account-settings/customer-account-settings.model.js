"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAccountSettings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Sub-schema for Google authentication provider
const googleAuthProviderSchema = new mongoose_1.Schema({
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
}, { _id: false });
// Sub-schema for Facebook authentication provider
const facebookAuthProviderSchema = new mongoose_1.Schema({
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
}, { _id: false });
// Sub-schema for Shop authentication provider
const shopAuthProviderSchema = new mongoose_1.Schema({
    enabled: {
        type: Boolean,
        default: true, // Shop auth is enabled by default
        required: true,
    },
    lastUpdatedAt: {
        type: Date,
        default: undefined,
    },
}, { _id: false });
// Main schema for Customer Account Settings
const customerAccountSettingsSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: function (v) {
                if (!v)
                    return true; // Optional field
                // Basic URL validation
                try {
                    new URL(v);
                    return true;
                }
                catch {
                    return false;
                }
            },
            message: 'customAccountUrl must be a valid URL',
        },
    },
}, {
    timestamps: true,
    versionKey: false,
});
// Indexes for efficient queries
customerAccountSettingsSchema.index({ storeId: 1 }, { unique: true });
customerAccountSettingsSchema.index({ 'googleAuth.enabled': 1 });
customerAccountSettingsSchema.index({ 'facebookAuth.enabled': 1 });
customerAccountSettingsSchema.index({ showSignInLinks: 1 });
// Pre-save middleware to update lastUpdatedAt for auth providers when they change
customerAccountSettingsSchema.pre('save', function (next) {
    const doc = this;
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
customerAccountSettingsSchema.methods.getAccountUrl = function (baseDomain) {
    if (this.customAccountUrl) {
        return this.customAccountUrl;
    }
    // Default URL format
    return baseDomain ? `${baseDomain}/account` : 'https://ziplofy.com/your-store/account';
};
// Static method to find or create settings for a store
customerAccountSettingsSchema.statics.findOrCreate = async function (storeId) {
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
exports.CustomerAccountSettings = mongoose_1.default.model('CustomerAccountSettings', customerAccountSettingsSchema);
