const mongoose = require('mongoose');

/**
 * Subdomain mapping for a webpanel Informatic store.
 * Separate from Codiic `storesubdomains`.
 */
const webpanelStoreSubdomainSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebpanelStore',
      required: true,
      unique: true,
      index: true,
    },
    subdomain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    customDomain: {
      type: String,
      trim: true,
      lowercase: true,
      // omit when unset — avoids unique-index collisions on null
    },
  },
  {
    timestamps: true,
    collection: 'webpanel_store_subdomains',
  }
);

webpanelStoreSubdomainSchema.index(
  { customDomain: 1 },
  { unique: true, sparse: true, partialFilterExpression: { customDomain: { $type: 'string' } } }
);

module.exports = mongoose.model('WebpanelStoreSubdomain', webpanelStoreSubdomainSchema);
