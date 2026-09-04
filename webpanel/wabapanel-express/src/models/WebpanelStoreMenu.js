const mongoose = require('mongoose');

const webpanelStoreMenuSchema = new mongoose.Schema(
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
    menuName: { type: String, required: true, trim: true, maxlength: 200 },
    handle: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
  },
  {
    timestamps: true,
    collection: 'webpanel_store_menus',
  }
);

webpanelStoreMenuSchema.index({ store: 1, handle: 1 }, { unique: true });

module.exports = mongoose.model('WebpanelStoreMenu', webpanelStoreMenuSchema);
