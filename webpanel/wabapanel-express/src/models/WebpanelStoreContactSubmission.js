const mongoose = require('mongoose');

const webpanelStoreContactSubmissionSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'WebpanelStore', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'read', 'archived', 'spam'],
      default: 'pending',
    },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'webpanel_store_contact_submissions' }
);

webpanelStoreContactSubmissionSchema.index({ store: 1, createdAt: -1 });

module.exports = mongoose.model(
  'WebpanelStoreContactSubmission',
  webpanelStoreContactSubmissionSchema
);
