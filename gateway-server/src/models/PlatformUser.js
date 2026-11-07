const mongoose = require('mongoose');

const platformUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, default: '' },
    hashedPassword: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, default: '' },
    emailVerified: { type: Boolean, default: false },
    emailOtpHash: { type: String, default: '' },
    emailOtpExpire: { type: Date },
    onboardingStatus: {
      type: String,
      enum: ['auth', 'awaiting_choice', 'provisioning', 'complete'],
      default: 'awaiting_choice',
    },
    selectedService: {
      type: String,
      enum: ['whatsapp_api', 'website_builder'],
      default: undefined,
    },
    industryKind: {
      type: String,
      enum: ['ecommerce', 'service'],
      default: undefined,
    },
    industry: { type: String, trim: true, default: '' },
    modulesChosen: { type: Boolean, default: false },
    selectedModules: { type: [String], default: [] },
    businessName: { type: String, trim: true, default: '' },
    billingTaxId: { type: String, trim: true, default: '' },
    billingAddress: { type: String, trim: true, default: '' },
    preferredTimezone: { type: String, trim: true, default: '' },
    preferredLanguage: { type: String, trim: true, default: '' },
    profileComplete: { type: Boolean, default: false },
    destination: {
      type: String,
      enum: ['codiic', 'webpanel'],
      default: undefined,
    },
    productUserId: { type: String, default: '' },
    productWorkspaceId: { type: String, default: '' },
    productStoreId: { type: String, default: '' },
    launchPath: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'platform_users',
  }
);

module.exports = mongoose.model('PlatformUser', platformUserSchema);
