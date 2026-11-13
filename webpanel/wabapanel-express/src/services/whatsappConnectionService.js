const axios = require('axios');
const WhatsAppConnection = require('../models/WhatsAppConnection');
const SystemSettings = require('../models/SystemSettings');

const META_GRAPH_URL = 'https://graph.facebook.com/v21.0';

// Meta app credentials: prefer the tenant's own app (workspace.whatsapp.metaApp),
// fall back to the platform-wide app from SystemSettings / env.
async function getAppCredentials(workspace) {
  const own = workspace?.whatsapp?.metaApp || {};
  if (own.appId && own.appSecret) {
    return { appId: own.appId, appSecret: own.appSecret, configId: own.configId || '' };
  }
  const settings = await SystemSettings.findOne().lean();
  return {
    appId: settings?.whatsapp?.appId || process.env.META_APP_ID || '',
    appSecret: settings?.whatsapp?.appSecret || process.env.META_APP_SECRET || '',
    configId: settings?.whatsapp?.configId || process.env.META_CONFIG_ID || '',
  };
}

// Upsert the tenant's connection record from workspace.whatsapp (the runtime
// config every other part of the app already reads).
async function syncFromWorkspace(workspace, extra = {}) {
  const wa = workspace.whatsapp || {};
  const status = wa.isConnected ? 'connected' : 'disconnected';
  const doc = await WhatsAppConnection.findOneAndUpdate(
    { tenant: workspace._id },
    {
      $set: {
        tenant: workspace._id,
        businessId: extra.businessId ?? (wa.businessAccountId || ''),
        wabaId: wa.wabaId || '',
        phoneNumberId: wa.phoneNumberId || '',
        phoneNumber: wa.phoneNumber || '',
        displayName: wa.displayName || '',
        qualityRating: wa.qualityRating || '',
        connectionMethod: wa.connectionMethod || '',
        connectionStatus: status,
        ...(status === 'connected'
          ? { connectedAt: new Date(), lastError: '', ...(wa.accessToken ? { accessToken: wa.accessToken } : {}) }
          : { disconnectedAt: new Date(), accessToken: '', tokenValid: false }),
        ...extra,
      },
      $setOnInsert: { history: [{ status, note: 'synced from workspace' }] },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return doc;
}

// Transition a tenant's connection status and record it in the audit trail.
async function setStatus(tenantId, status, note = '', extra = {}) {
  const update = {
    $set: { connectionStatus: status, ...extra },
    $push: { history: { $each: [{ status, note: String(note).slice(0, 300), at: new Date() }], $slice: -50 } },
  };
  if (status === 'connected') update.$set.connectedAt = new Date();
  if (status === 'disconnected') update.$set.disconnectedAt = new Date();
  if (!('lastError' in extra)) update.$set.lastError = status === 'connected' ? '' : String(note || '');
  return WhatsAppConnection.findOneAndUpdate({ tenant: tenantId }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
}

// Inspect a Meta token via debug_token. Returns normalized token metadata.
async function debugToken(accessToken, workspace) {
  const { appId, appSecret } = await getAppCredentials(workspace);
  if (!appId || !appSecret) throw new Error('Meta App credentials not configured');
  const r = await axios.get(`${META_GRAPH_URL}/debug_token`, {
    params: { input_token: accessToken, access_token: `${appId}|${appSecret}` },
    timeout: 15000,
  });
  const d = r.data?.data || {};
  return {
    valid: !!d.is_valid,
    type: d.type || '',
    appId: d.app_id || '',
    scopes: d.granular_scopes
      ? [...new Set([].concat(...d.granular_scopes.map(g => g.scope || []), d.scopes || []))]
      : (d.scopes || []),
    // expires_at = 0 means the token never expires (system user token)
    expiresAt: d.expires_at ? new Date(d.expires_at * 1000) : null,
    error: d.error?.message || '',
  };
}

// Re-validate a single connection's token and update its lifecycle fields.
async function checkToken(conn) {
  const token = conn.accessToken;
  if (!token) {
    conn.tokenValid = false;
    conn.lastTokenCheckAt = new Date();
    conn.lastTokenError = 'No access token stored';
    return conn;
  }
  try {
    const Workspace = require('../models/Workspace');
    const workspace = await Workspace.findById(conn.tenant).select('whatsapp.metaApp').lean();
    const info = await debugToken(token, workspace);
    conn.tokenValid = info.valid;
    conn.tokenType = info.type || conn.tokenType;
    conn.scopes = info.scopes.length ? info.scopes : conn.scopes;
    conn.tokenExpiresAt = info.expiresAt;
    conn.lastTokenCheckAt = new Date();
    conn.lastTokenError = info.valid ? '' : (info.error || 'Token invalid');
  } catch (e) {
    conn.lastTokenCheckAt = new Date();
    conn.lastTokenError = e.response?.data?.error?.message || e.message;
  }
  return conn;
}

// Periodic lifecycle sweep: re-check every tenant's token, move broken
// connections to "pending" so the dashboard shows they need attention.
async function runTokenLifecycleSweep() {
  const connections = await WhatsAppConnection.find({
    connectionStatus: { $in: ['connected', 'pending'] },
    accessToken: { $exists: true, $ne: '' },
  }).select('+accessToken');

  let checked = 0, invalidated = 0;
  for (const conn of connections) {
    try {
      await checkToken(conn);
      checked++;
      if (conn.tokenValid && conn.connectionStatus === 'pending' && conn.lastTokenError === '') {
        conn.pushHistory('connected', 'token re-validated');
        conn.connectionStatus = 'connected';
      } else if (!conn.tokenValid && conn.connectionStatus === 'connected') {
        conn.pushHistory('pending', conn.lastTokenError || 'token expired or revoked');
        conn.connectionStatus = 'pending';
        invalidated++;
        try {
          await require('./ownerNotify').notifyOwner(
            conn.tenant,
            '⚠️ Your WhatsApp connection needs attention — the Meta access token expired or was revoked. Reconnect from the WhatsApp settings page to keep receiving messages.',
            'wa_token'
          );
        } catch (e) { /* notification is best-effort */ }
      }
      await conn.save();
    } catch (e) {
      console.error('[WA-TokenSweep]', conn.tenant, e.message);
    }
  }
  if (checked) console.log(`[WA-TokenSweep] checked=${checked} invalidated=${invalidated}`);
  return { checked, invalidated };
}

module.exports = { syncFromWorkspace, setStatus, debugToken, checkToken, runTokenLifecycleSweep, getAppCredentials };
