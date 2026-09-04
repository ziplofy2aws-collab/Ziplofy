const WebpanelStore = require('../models/WebpanelStore');
const WebpanelStoreSubdomain = require('../models/WebpanelStoreSubdomain');

function slugifyBase(name) {
  const base = String(name || 'store')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'store';
}

/**
 * Create a unique `{slug}-{4char}` subdomain for a store.
 * Retries on Mongo duplicate key (11000).
 */
async function assignDefaultSubdomain(storeId, storeName, { maxAttempts = 8 } = {}) {
  const base = slugifyBase(storeName);
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const subdomain = `${base}-${suffix}`;
    try {
      const row = await WebpanelStoreSubdomain.create({ storeId, subdomain });
      return row;
    } catch (err) {
      lastError = err;
      if (err && err.code === 11000) continue;
      throw err;
    }
  }

  throw lastError || new Error('Failed to allocate unique subdomain');
}

/**
 * Create a webpanel store + default Informatic subdomain for a user.
 */
async function createWebpanelStoreWithSubdomain({
  userId,
  workspaceId = null,
  storeName,
  storeDescription,
}) {
  const store = await WebpanelStore.create({
    userId,
    workspace: workspaceId || null,
    storeName: String(storeName).trim(),
    storeDescription: String(storeDescription).trim(),
  });

  let subdomainDoc = null;
  try {
    subdomainDoc = await assignDefaultSubdomain(store._id, store.storeName);
  } catch (err) {
    console.error('[webpanel-store] subdomain create failed:', err?.message || err);
  }

  return { store, subdomain: subdomainDoc };
}

/**
 * Signup bootstrap: one default store + subdomain for the new vendor.
 */
async function createDefaultStoreForNewUser(user, workspace) {
  const displayName = (user?.name || user?.email?.split('@')[0] || 'My').trim();
  const storeName = `${displayName}'s Website`.slice(0, 100);
  const storeDescription =
    'Default Informatic website created on signup. Customize themes and content anytime.'.slice(0, 500);

  return createWebpanelStoreWithSubdomain({
    userId: user._id,
    workspaceId: workspace?._id || user.currentWorkspace || null,
    storeName,
    storeDescription,
  });
}

/**
 * If the user has no stores yet (legacy accounts), create the default one.
 */
async function ensureDefaultStoreForUser(user) {
  const count = await WebpanelStore.countDocuments({ userId: user._id });
  if (count > 0) return null;
  return createDefaultStoreForNewUser(user, { _id: user.currentWorkspace });
}

module.exports = {
  slugifyBase,
  assignDefaultSubdomain,
  createWebpanelStoreWithSubdomain,
  createDefaultStoreForNewUser,
  ensureDefaultStoreForUser,
};
