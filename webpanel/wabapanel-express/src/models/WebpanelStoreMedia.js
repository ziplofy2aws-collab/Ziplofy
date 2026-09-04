const mongoose = require('mongoose');

/**
 * Per-store media registry (S3 object key + metadata).
 * Files live on AWS; this collection tracks what the merchant uploaded for their Informatic store.
 */
const webpanelStoreMediaSchema = new mongoose.Schema(
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
    /** S3 object key, e.g. webpanel-stores/{storeId}/media/{timestamp}-{uuid}-photo.jpg */
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1024,
    },
    originalName: {
      type: String,
      trim: true,
      default: '',
    },
    mimeType: {
      type: String,
      trim: true,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
    /** Cached public object URL at upload time */
    url: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'webpanel_store_media',
    versionKey: false,
  }
);

webpanelStoreMediaSchema.index({ store: 1, key: 1 }, { unique: true });
webpanelStoreMediaSchema.index({ store: 1, createdAt: -1 });

module.exports = mongoose.model('WebpanelStoreMedia', webpanelStoreMediaSchema);
