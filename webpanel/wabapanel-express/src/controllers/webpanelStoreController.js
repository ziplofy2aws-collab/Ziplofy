const WebpanelStore = require('../models/WebpanelStore');
const WebpanelStoreSubdomain = require('../models/WebpanelStoreSubdomain');
const {
  createWebpanelStoreWithSubdomain,
  ensureDefaultStoreForUser,
} = require('../utils/webpanelStoreBootstrap');

function serializeStore(store, subdomainDoc) {
  const plain = store.toObject ? store.toObject() : store;
  return {
    _id: plain._id,
    userId: plain.userId,
    workspace: plain.workspace,
    storeName: plain.storeName,
    storeDescription: plain.storeDescription,
    appliedTheme: plain.appliedTheme,
    status: plain.status,
    storeCode: plain.storeCode,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    subdomain: subdomainDoc
      ? {
          _id: subdomainDoc._id,
          subdomain: subdomainDoc.subdomain,
          customDomain: subdomainDoc.customDomain || null,
        }
      : null,
  };
}

async function attachSubdomains(stores) {
  const ids = stores.map((s) => s._id);
  const rows = await WebpanelStoreSubdomain.find({ storeId: { $in: ids } }).lean();
  const byStore = new Map(rows.map((r) => [String(r.storeId), r]));
  return stores.map((s) => serializeStore(s, byStore.get(String(s._id)) || null));
}

// @GET /api/stores
const listStores = async (req, res) => {
  try {
    await ensureDefaultStoreForUser(req.user);

    const stores = await WebpanelStore.find({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .lean();

    const data = await attachSubdomains(stores);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/stores/:id
const getStore = async (req, res) => {
  try {
    const store = await WebpanelStore.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    const subdomain = await WebpanelStoreSubdomain.findOne({ storeId: store._id }).lean();
    res.json({ success: true, data: serializeStore(store, subdomain) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/stores
const createStore = async (req, res) => {
  try {
    const storeName = String(req.body.storeName || '').trim();
    const storeDescription = String(req.body.storeDescription || '').trim();

    if (storeName.length < 2) {
      return res.status(400).json({ success: false, message: 'Store name must be at least 2 characters' });
    }
    if (storeDescription.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Store description must be at least 10 characters',
      });
    }

    const existing = await WebpanelStore.findOne({
      userId: req.user._id,
      storeName: { $regex: new RegExp(`^${storeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A store with this name already exists for your account',
      });
    }

    const { store, subdomain } = await createWebpanelStoreWithSubdomain({
      userId: req.user._id,
      workspaceId: req.user.currentWorkspace || null,
      storeName,
      storeDescription,
    });

    if (!subdomain) {
      return res.status(201).json({
        success: true,
        warning: 'Store created but subdomain could not be allocated',
        data: serializeStore(store, null),
      });
    }

    res.status(201).json({
      success: true,
      data: serializeStore(store, subdomain),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A store with this name already exists for your account',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Public storefront resolve — used by webpanel-store-renderer.
 * GET /api/store-subdomain/check?subdomain=  OR  ?host=
 */
const checkStoreSubdomain = async (req, res) => {
  try {
    const subdomainParam = String(req.query.subdomain || '')
      .trim()
      .toLowerCase();
    const hostParam = String(req.query.host || '')
      .trim()
      .toLowerCase();

    if (!subdomainParam && !hostParam) {
      return res.status(400).json({
        success: false,
        message: 'Provide subdomain or host query parameter',
      });
    }

    let mapping = null;
    if (subdomainParam) {
      mapping = await WebpanelStoreSubdomain.findOne({ subdomain: subdomainParam }).lean();
    }
    if (!mapping && hostParam) {
      // Full host may be a custom domain, or "{sub}.crm-360.codiic.com" / "{sub}.localhost"
      mapping = await WebpanelStoreSubdomain.findOne({ customDomain: hostParam }).lean();
      if (!mapping) {
        const firstLabel = hostParam.split('.')[0];
        if (firstLabel) {
          mapping = await WebpanelStoreSubdomain.findOne({ subdomain: firstLabel }).lean();
        }
      }
    }

    if (!mapping) {
      return res.status(404).json({ success: false, message: 'Store subdomain not found' });
    }

    const store = await WebpanelStore.findById(mapping.storeId).lean();
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    if (store.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Store is suspended' });
    }

    return res.json({
      success: true,
      data: {
        storeId: String(store._id),
        name: store.storeName,
        description: store.storeDescription,
        subdomain: mapping.subdomain,
        customDomain: mapping.customDomain || null,
        status: store.status || 'active',
        storeCode: store.storeCode || null,
        appliedTheme: store.appliedTheme ? String(store.appliedTheme) : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listStores,
  getStore,
  createStore,
  checkStoreSubdomain,
};
