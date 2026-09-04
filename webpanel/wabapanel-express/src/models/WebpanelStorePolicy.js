const mongoose = require('mongoose');

const POLICY_TYPES = ['return-refund', 'privacy', 'terms', 'contact'];

const webpanelStorePolicySchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebpanelStore',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    policyType: {
      type: String,
      enum: POLICY_TYPES,
      required: true,
    },
    content: { type: String, default: '', maxlength: 500000 },
  },
  {
    timestamps: true,
    collection: 'webpanel_store_policies',
  }
);

webpanelStorePolicySchema.index({ store: 1, policyType: 1 }, { unique: true });

module.exports = mongoose.model('WebpanelStorePolicy', webpanelStorePolicySchema);
module.exports.POLICY_TYPES = POLICY_TYPES;
