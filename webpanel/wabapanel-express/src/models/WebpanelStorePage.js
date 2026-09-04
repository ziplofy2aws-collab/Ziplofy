const mongoose = require('mongoose');

const VISIBILITY = ['visible', 'hidden'];

const webpanelStorePageSchema = new mongoose.Schema(
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
    title: { type: String, required: true, trim: true, maxlength: 255 },
    content: { type: String, default: '', maxlength: 1000000 },
    pageTitle: { type: String, trim: true, maxlength: 70, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 320, default: '' },
    urlHandle: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    visibility: {
      type: String,
      enum: VISIBILITY,
      default: 'hidden',
    },
    themeTemplate: {
      type: String,
      trim: true,
      default: 'default',
      maxlength: 120,
    },
  },
  {
    timestamps: true,
    collection: 'webpanel_store_pages',
  }
);

webpanelStorePageSchema.index({ store: 1, urlHandle: 1 }, { unique: true });
webpanelStorePageSchema.index({ store: 1, updatedAt: -1 });

module.exports = mongoose.model('WebpanelStorePage', webpanelStorePageSchema);
module.exports.VISIBILITY = VISIBILITY;
