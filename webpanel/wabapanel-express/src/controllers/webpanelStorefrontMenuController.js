const mongoose = require('mongoose');
const WebpanelStoreMenu = require('../models/WebpanelStoreMenu');
const WebpanelStoreMenuItem = require('../models/WebpanelStoreMenuItem');
const {
  enrichMenuItemsWithHref,
  serializeMenu,
} = require('./webpanelStoreMenuController');

function assertValidStoreId(storeId) {
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    const err = new Error('Valid storeId is required');
    err.statusCode = 400;
    throw err;
  }
}

/** GET /api/storefront/:storeId/menus */
const listStorefrontMenus = async (req, res) => {
  try {
    const { storeId } = req.params;
    assertValidStoreId(storeId);
    const menus = await WebpanelStoreMenu.find({ store: storeId }).sort({ updatedAt: -1 }).lean();
    const data = await Promise.all(
      menus.map(async (menu) => {
        const items = await WebpanelStoreMenuItem.find({ menu: menu._id }).sort({ position: 1 }).lean();
        const enrichedItems = await enrichMenuItemsWithHref(items);
        return {
          ...serializeMenu(menu),
          items: enrichedItems.map(({ label, href, position }) => ({ label, href, position })),
        };
      })
    );
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to list menus' });
  }
};

/** GET /api/storefront/:storeId/menus/by-handle/:handle */
const getStorefrontMenuByHandle = async (req, res) => {
  try {
    const { storeId, handle } = req.params;
    assertValidStoreId(storeId);
    const menu = await WebpanelStoreMenu.findOne({
      store: storeId,
      handle: String(handle || '').trim().toLowerCase(),
    }).lean();
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    const items = await WebpanelStoreMenuItem.find({ menu: menu._id }).sort({ position: 1 }).lean();
    const enrichedItems = await enrichMenuItemsWithHref(items);
    res.json({
      success: true,
      data: {
        ...serializeMenu(menu),
        items: enrichedItems.map(({ label, href, position, linkType }) => ({
          label,
          href,
          position,
          linkType,
        })),
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to get menu' });
  }
};

/** GET /api/storefront/:storeId/menus/:menuId */
const getStorefrontMenuById = async (req, res) => {
  try {
    const { storeId, menuId } = req.params;
    assertValidStoreId(storeId);
    if (!mongoose.Types.ObjectId.isValid(menuId)) {
      return res.status(400).json({ success: false, message: 'Invalid menu id' });
    }
    const menu = await WebpanelStoreMenu.findOne({ _id: menuId, store: storeId }).lean();
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    const items = await WebpanelStoreMenuItem.find({ menu: menu._id }).sort({ position: 1 }).lean();
    const enrichedItems = await enrichMenuItemsWithHref(items);
    res.json({
      success: true,
      data: {
        ...serializeMenu(menu),
        items: enrichedItems.map(({ label, href, position, linkType }) => ({
          label,
          href,
          position,
          linkType,
        })),
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to get menu' });
  }
};

module.exports = {
  listStorefrontMenus,
  getStorefrontMenuByHandle,
  getStorefrontMenuById,
};
