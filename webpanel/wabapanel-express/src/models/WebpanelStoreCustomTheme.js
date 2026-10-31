const mongoose = require('mongoose');

/**
 * Per-store custom theme created in the ported create-theme builder.
 * Stores the full Shopify-style themeConfig JSON (sections/templates/settings).
 */
const webpanelStoreCustomThemeSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebpanelStore',
      required: true,
      index: true,
    },
    themeName: { type: String, required: true, trim: true, maxlength: 200 },
    themeDesc: { type: String, trim: true, maxlength: 2000, default: null },
    themeConfig: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
    collection: 'webpanel_store_custom_themes',
  }
);

webpanelStoreCustomThemeSchema.index({ store: 1, updatedAt: -1 });

module.exports = mongoose.model('WebpanelStoreCustomTheme', webpanelStoreCustomThemeSchema);
