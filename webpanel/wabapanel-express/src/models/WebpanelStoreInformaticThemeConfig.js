const mongoose = require('mongoose');

/**
 * Per-store Informatic theme customization JSON (merged config).
 * Mirrors Codiic StoreThemeConfig for catalog themes.
 */
const webpanelStoreInformaticThemeConfigSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebpanelStore',
      required: true,
      index: true,
    },
    informaticThemeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    /** Full merged theme config JSON (editor state). */
    config: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'webpanel_store_informatic_theme_configs',
    versionKey: false,
  }
);

webpanelStoreInformaticThemeConfigSchema.index(
  { store: 1, informaticThemeId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'WebpanelStoreInformaticThemeConfig',
  webpanelStoreInformaticThemeConfigSchema
);
