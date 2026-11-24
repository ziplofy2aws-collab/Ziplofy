const mongoose = require('mongoose');

/**
 * Custom domains connected to a webpanel Informatic store.
 * Mirrors Codiic `storedomains` — separate collection so flows never collide.
 */
const dnsInstructionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['CNAME', 'ALIAS', 'A', 'TXT'], required: true },
    host: { type: String, required: true },
    value: { type: String, required: true },
    purpose: { type: String, required: true },
  },
  { _id: false }
);

const webpanelStoreDomainSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebpanelStore',
      required: true,
      index: true,
    },
    hostname: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['connected'],
      default: 'connected',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verifying', 'active', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    isPrimary: { type: Boolean, default: false },
    verificationToken: { type: String, required: true },
    dnsInstructions: { type: [dnsInstructionSchema], default: [] },
    cloudflareCustomHostnameId: { type: String, default: null, index: true },
    sslStatus: {
      type: String,
      enum: ['not_configured', 'pending', 'issuing', 'active', 'failed', 'expired', 'error', 'deleted'],
      default: 'not_configured',
      index: true,
    },
    sslProvider: { type: String, enum: ['letsencrypt', 'none'], default: 'none' },
    sslError: { type: String, default: null },
    sslIssuedAt: { type: Date, default: null },
    sslExpiresAt: { type: Date, default: null },
    lastSslCheckAt: { type: Date, default: null },
    sslAttemptCount: { type: Number, default: 0 },
    sslNextRetryAt: { type: Date, default: null },
    sslLockedUntil: { type: Date, default: null },
    sslLockedBy: { type: String, default: null },
    certificatePath: { type: String, default: null },
    privateKeyPath: { type: String, default: null },
    verifiedAt: { type: Date, default: null },
    lastError: { type: String, default: null },
  },
  { timestamps: true, collection: 'webpanel_store_domains' }
);

webpanelStoreDomainSchema.index({ storeId: 1, status: 1 });
// Worker poll: verified domains whose SSL job is due and not locked.
webpanelStoreDomainSchema.index({ status: 1, sslStatus: 1, sslNextRetryAt: 1 });

module.exports = mongoose.model('WebpanelStoreDomain', webpanelStoreDomainSchema);
