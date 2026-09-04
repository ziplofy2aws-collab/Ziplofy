const mongoose = require('mongoose');

/**
 * Tracks Informatic catalog themes installed on a webpanel store.
 * Mirrors Codiic InstalledThemes (store + theme reference + install timestamps).
 */
const webpanelInformaticInstalledThemeSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebpanelStore',
      required: true,
      index: true,
    },
    /** Catalog theme id from codiic-server (informatic_themes._id). */
    informaticThemeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    installedAt: {
      type: Date,
      default: null,
    },
    uninstalledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'webpanel_informatic_installed_themes',
    versionKey: false,
  }
);

webpanelInformaticInstalledThemeSchema.index(
  { store: 1, informaticThemeId: 1 },
  { unique: true }
);

webpanelInformaticInstalledThemeSchema.index({ store: 1, uninstalledAt: 1, installedAt: -1 });

module.exports = mongoose.model(
  'WebpanelInformaticInstalledTheme',
  webpanelInformaticInstalledThemeSchema
);
