const mongoose = require('mongoose');
const WebpanelStore = require('../models/WebpanelStore');
const { resolveStoreInformaticThemeRuntime } = require('../utils/webpanelInformaticThemeRuntime.util');
const { stripThemeConfigSecrets } = require('../utils/informaticThemeConfigSecrets.util');

/**
 * Public storefront theme runtime — used by webpanel-store-renderer.
 * GET /api/storefront/:storeId/informatic-theme-runtime
 */
const getStorefrontInformaticThemeRuntime = async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store id' });
    }

    const store = await WebpanelStore.findById(storeId).lean();
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    if (store.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Store is suspended' });
    }

    const appliedThemeId = store.appliedTheme ? String(store.appliedTheme) : null;
    if (!appliedThemeId) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No applied Informatic theme for this store',
      });
    }

    const data = await resolveStoreInformaticThemeRuntime(storeId, appliedThemeId);
    if (!data) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Applied theme is not installed for this store',
      });
    }

    return res.json({
      success: true,
      data: {
        ...data,
        themeConfig: stripThemeConfigSecrets(data.themeConfig),
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to load Informatic theme runtime',
    });
  }
};

module.exports = {
  getStorefrontInformaticThemeRuntime,
};
