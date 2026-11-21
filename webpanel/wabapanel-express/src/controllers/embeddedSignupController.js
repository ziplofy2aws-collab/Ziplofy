const axios = require('axios');
const crypto = require('crypto');
const Workspace = require('../models/Workspace');
const SystemSettings = require('../models/SystemSettings');
const waConnection = require('../services/whatsappConnectionService');

const META_GRAPH_URL = 'https://graph.facebook.com/v21.0';

// Resolve the tenant workspace for both route mount styles:
//  - /api/workspaces/:id/whatsapp/embedded-signup (workspaceParamOwner -> req.workspaceDoc)
//  - /api/embedded-signup/*                    (workspaceAccess      -> req.workspace)
async function resolveWorkspace(req) {
  if (req.workspaceDoc) return req.workspaceDoc;
  if (req.workspace) return req.workspace;
  if (req.params.id) return Workspace.findById(req.params.id);
  return null;
}

function apiDomain(req) {
  return (process.env.API_URL || process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

function frontendUrl() {
  return (process.env.FRONTEND_URL || 'http://localhost:3002').replace(/\/$/, '');
}

// OAuth state = workspaceId + HMAC signature, so the public callback can
// identify the tenant without an auth header and can't be forged for
// another tenant.
function signState(workspaceId, appSecret) {
  return crypto.createHmac('sha256', appSecret).update(String(workspaceId)).digest('hex').slice(0, 24);
}

// The full Phase-6 onboarding sequence: exchange code -> resolve WABA/phone ->
// subscribe webhooks -> register phone -> persist workspace + connection record.
// Returns { ok, message, data } — never writes to res.
async function performEmbeddedSignup(workspace, { code, sessionWabaId, sessionPhoneNumberId, sessionBusinessId, coexistence, redirectUri = '' }) {
  const { appId, appSecret } = await waConnection.getAppCredentials(workspace);
  if (!appId || !appSecret) {
    return {
      ok: false, status: 400,
      message: 'Meta App ID and Secret not configured. Add your Meta app below, or ask the admin to configure the platform app.',
    };
  }

  // Mark the tenant "pending" while onboarding runs — if we fail part-way the
  // dashboard will show the connection needs attention instead of silent limbo.
  await waConnection.setStatus(workspace._id, 'pending', 'embedded signup in progress');

  // Exchange code for token. redirect_uri must match the value used to obtain
  // the code — '' for the JS SDK popup, the callback URL for the OAuth redirect.
  const tokenResponse = await axios.get(`${META_GRAPH_URL}/oauth/access_token`, {
    params: {
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    },
  });

  const accessToken = tokenResponse.data.access_token;
  if (!accessToken) {
    await waConnection.setStatus(workspace._id, 'pending', 'failed to obtain access token from Meta');
    return { ok: false, status: 400, message: 'Failed to get access token from Meta' };
  }

  // Inspect the token — captures expiry + granted scopes for lifecycle management.
  let tokenMeta = { valid: true, type: '', scopes: [], expiresAt: null };
  try {
    tokenMeta = await waConnection.debugToken(accessToken, workspace);
  } catch (e) {
    console.error('debug_token failed:', e.response?.data?.error?.message || e.message);
  }
  const grantedScopes = tokenMeta.scopes || [];

  // Get WABA and phone number details.
  // Prefer the IDs captured from Embedded Signup session logging (most reliable);
  // fall back to Graph discovery when they are not available.
  let wabaId = sessionWabaId || '';
  let phoneNumberId = sessionPhoneNumberId || '';
  let businessId = sessionBusinessId || '';
  let phoneNumber = '';
  let displayName = '';

  try {
    if (!wabaId) {
      // List WABA accounts shared with us
      const wabaListResponse = await axios.get(
        `${META_GRAPH_URL}/me/whatsapp_business_accounts`,
        {
          params: { fields: 'id,name,account_review_status' },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const wabas = wabaListResponse.data?.data || [];
      if (wabas.length > 0) {
        wabaId = wabas[0].id;
      }
    }

    if (wabaId) {
      // Get phone numbers for this WABA
      const phoneResponse = await axios.get(
        `${META_GRAPH_URL}/${wabaId}/phone_numbers`,
        {
          params: { fields: 'id,display_phone_number,verified_name,quality_rating' },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const phones = phoneResponse.data?.data || [];
      // Match the phone from session info if provided, else take the first
      const phone = phones.find(p => p.id === sessionPhoneNumberId) || phones[0];
      if (phone) {
        phoneNumberId = phone.id;
        phoneNumber = phone.display_phone_number;
        displayName = phone.verified_name || '';
      }

      // The customer's Meta Business Portfolio ID — session info first,
      // then the WABA's owning business.
      if (!businessId) {
        try {
          const wabaInfo = await axios.get(`${META_GRAPH_URL}/${wabaId}`, {
            params: { fields: 'owner_business' },
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          businessId = wabaInfo.data?.owner_business?.id || '';
        } catch (e) { /* best-effort */ }
      }
    }
  } catch (err) {
    console.error('Error fetching WABA details:', err.response?.data || err.message);
  }

  if (!wabaId || !phoneNumberId) {
    await waConnection.setStatus(workspace._id, 'pending', 'signup finished but WABA/phone number could not be resolved');
    return {
      ok: false, status: 400,
      message: 'WhatsApp Business Account not found. Complete the signup flow or try again.',
    };
  }

  // Subscribe our app to this WABA so webhooks (messages + coexistence events) are delivered.
  // We also set a WABA-level webhook override so incoming messages are delivered straight to
  // THIS panel's own domain — the customer never has to configure a callback URL in Meta.
  let webhookSubscribed = false;
  const settings = await SystemSettings.findOne();
  const domain = process.env.API_URL || process.env.BACKEND_URL || 'https://crm-backend.codiic.com';
  const overrideCallbackUri = `${domain.replace(/\/$/, '')}/api/webhook/whatsapp`;
  const verifyToken = settings?.whatsapp?.webhookVerifyToken || process.env.WHATSAPP_VERIFY_TOKEN || '';
  try {
    const subParams = { override_callback_uri: overrideCallbackUri };
    if (verifyToken) subParams.verify_token = verifyToken;
    await axios.post(
      `${META_GRAPH_URL}/${wabaId}/subscribed_apps`,
      null,
      { params: subParams, headers: { Authorization: `Bearer ${accessToken}` } }
    );
    webhookSubscribed = true;
  } catch (err) {
    console.error('Error subscribing app to WABA (with override):', err.response?.data || err.message);
    // Fallback: subscribe without override so at least the global app webhook receives events.
    try {
      await axios.post(
        `${META_GRAPH_URL}/${wabaId}/subscribed_apps`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      webhookSubscribed = true;
    } catch (err2) {
      console.error('Error subscribing app to WABA:', err2.response?.data || err2.message);
    }
  }

  // Register the phone number on Cloud API (two-step PIN). Best-effort — newly
  // onboarded numbers may already be registered, in which case Meta returns an
  // error we can safely ignore.
  try {
    const regPin = settings?.whatsapp?.registerPin || process.env.WHATSAPP_REGISTER_PIN || '123456';
    await axios.post(
      `${META_GRAPH_URL}/${phoneNumberId}/register`,
      { messaging_product: 'whatsapp', pin: regPin },
      { headers: { Authorization: `Bearer ${accessToken}` }, timeout: 10000 }
    );
  } catch (err) {
    console.log('[EmbeddedSignup] phone register:', err.response?.data?.error?.message || err.message);
  }

  const connectionMethod = coexistence ? 'coexistence' : 'embedded';

  // Update workspace with WhatsApp credentials (preserving extra numbers,
  // ads token and payment config a previous connection may have stored).
  const prevWa = workspace.whatsapp?.toObject?.() || workspace.whatsapp || {};
  workspace.whatsapp = {
    ...prevWa,
    isConnected: true,
    connectionMethod,
    wabaId,
    phoneNumberId,
    businessAccountId: businessId || prevWa.businessAccountId || '',
    accessToken,
    phoneNumber,
    displayName,
    qualityRating: '',
  };
  await workspace.save();

  // Persist the tenant-level connection record (token lifecycle + audit trail).
  await waConnection.setStatus(workspace._id, 'connected', `signup completed (${connectionMethod})`, {
    businessId,
    wabaId,
    phoneNumberId,
    phoneNumber,
    displayName,
    connectionMethod,
    accessToken,
    tokenType: tokenMeta.type || '',
    scopes: grantedScopes,
    tokenExpiresAt: tokenMeta.expiresAt,
    tokenValid: tokenMeta.valid !== false,
    lastTokenCheckAt: new Date(),
    webhookSubscribed,
    webhookSubscribedAt: webhookSubscribed ? new Date() : null,
  });

  return {
    ok: true,
    data: {
      isConnected: true,
      connectionMethod,
      connectionStatus: 'connected',
      wabaId,
      phoneNumberId,
      businessId,
      phoneNumber,
      displayName,
      scopes: grantedScopes,
      webhookSubscribed,
    },
  };
}

// @POST /api/workspaces/:id/whatsapp/embedded-signup
// Handles the OAuth callback from Meta Embedded Signup (JS SDK popup flow)
const handleEmbeddedSignup = async (req, res) => {
  let workspace = null;
  try {
    const {
      code,
      wabaId: sessionWabaId,
      phoneNumberId: sessionPhoneNumberId,
      businessId: sessionBusinessId,
      coexistence,
    } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code required' });
    }

    workspace = await resolveWorkspace(req);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const result = await performEmbeddedSignup(workspace, {
      code, sessionWabaId, sessionPhoneNumberId, sessionBusinessId, coexistence,
      redirectUri: '',
    });
    if (!result.ok) return res.status(result.status || 500).json({ success: false, message: result.message });
    res.json({ success: true, data: result.data });
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error('Embedded signup error:', errMsg);
    if (workspace?._id) {
      await waConnection.setStatus(workspace._id, 'pending', errMsg).catch(() => {});
    }
    res.status(500).json({ success: false, message: errMsg });
  }
};

// @GET /api/workspaces/:id/whatsapp/oauth-url?coexistence=0|1
// Builds the Facebook OAuth URL the tenant is redirected to. All credential
// handling stays in the backend — the frontend just navigates to this URL.
const getOAuthUrl = async (req, res) => {
  try {
    const workspace = await resolveWorkspace(req);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const { appId, appSecret, configId } = await waConnection.getAppCredentials(workspace);
    if (!appId || !appSecret || !configId) {
      return res.status(400).json({
        success: false,
        message: 'Meta app not configured. Add your Meta App ID / Secret / Config ID below, or ask the admin to configure the platform app.',
      });
    }

    const coexistence = req.query.coexistence === '1' || req.query.coexistence === 'true';
    const callbackUri = `${apiDomain(req)}/api/embedded-signup/callback`;
    const state = `${workspace._id}.${signState(workspace._id, appSecret)}`;
    const extras = {
      setup: {},
      featureType: coexistence ? 'whatsapp_business_app_onboarding' : 'only_waba_sharing',
      sessionInfoVersion: coexistence ? 3 : 2,
    };

    const url = 'https://www.facebook.com/v21.0/dialog/oauth'
      + `?client_id=${encodeURIComponent(appId)}`
      + `&redirect_uri=${encodeURIComponent(callbackUri)}`
      + '&response_type=code'
      + `&config_id=${encodeURIComponent(configId)}`
      + `&state=${encodeURIComponent(state)}`
      + `&extras=${encodeURIComponent(JSON.stringify(extras))}`;

    res.json({ success: true, data: { url, callbackUri } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/embedded-signup/callback  (PUBLIC — Meta redirects the browser here)
// Exchanges the code, runs the full onboarding, then sends the browser back to
// the tenant's WhatsApp settings page with the outcome in the query string.
const oauthCallback = async (req, res) => {
  const back = (params) => res.redirect(`${frontendUrl()}/client/whatsapp?${params}`);

  try {
    // User cancelled or Meta returned an error
    if (req.query.error) {
      const msg = req.query.error_description || req.query.error_reason || req.query.error;
      return back(`wa=error&msg=${encodeURIComponent(String(msg).slice(0, 200))}`);
    }

    const { code, state } = req.query;
    if (!code || !state || !state.includes('.')) {
      return back('wa=error&msg=' + encodeURIComponent('Invalid OAuth response from Meta'));
    }

    const [workspaceId, sig] = state.split('.');
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return back('wa=error&msg=' + encodeURIComponent('Workspace not found'));
    }

    const { appId, appSecret } = await waConnection.getAppCredentials(workspace);
    const expected = signState(workspaceId, appSecret || '');
    if (!appSecret || sig !== expected) {
      return back('wa=error&msg=' + encodeURIComponent('Invalid OAuth state — please try connecting again'));
    }

    const callbackUri = `${apiDomain(req)}/api/embedded-signup/callback`;
    const result = await performEmbeddedSignup(workspace, {
      code,
      redirectUri: callbackUri,
    });

    if (!result.ok) {
      return back(`wa=error&msg=${encodeURIComponent(String(result.message || 'Connection failed').slice(0, 200))}`);
    }
    return back('wa=connected');
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    console.error('OAuth callback error:', errMsg);
    return back(`wa=error&msg=${encodeURIComponent(String(errMsg).slice(0, 200))}`);
  }
};

// @GET /api/workspaces/:id/whatsapp/embedded-signup/config
// Returns the embedded signup configuration for the frontend SDK
const getEmbeddedSignupConfig = async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    const workspace = await resolveWorkspace(req);

    // Tenant's own Meta app wins when fully configured; otherwise platform app.
    const ownApp = workspace?.whatsapp?.metaApp || {};
    const ownAppReady = !!(ownApp.appId && ownApp.appSecret && ownApp.configId);

    const appId = ownApp.appId || settings?.whatsapp?.appId || process.env.META_APP_ID || '';
    const configId = ownApp.configId || settings?.whatsapp?.configId || process.env.META_CONFIG_ID || '';
    // Platform app is "enabled" when the admin flips the flag OR provides creds via env.
    const envReady = !!(process.env.META_APP_ID && process.env.META_APP_SECRET && process.env.META_CONFIG_ID);
    const platformEnabled = (settings?.whatsapp?.enableEmbeddedSignup || false) || envReady;
    const enableEmbeddedSignup = ownAppReady || platformEnabled;
    const enableManualSignup = settings?.whatsapp?.enableManualSignup !== false;
    const enableCoexistence = settings?.whatsapp?.enableCoexistence || false;

    if (!appId && enableEmbeddedSignup) {
      return res.status(400).json({
        success: false,
        message: 'Meta App ID not configured',
      });
    }

    const webhookVerifyToken = settings?.whatsapp?.webhookVerifyToken || process.env.WHATSAPP_VERIFY_TOKEN || '';
    const webhookUrl = `${apiDomain(req)}/api/webhook/whatsapp`;

    res.json({
      success: true,
      data: {
        appId,
        configId,
        enableEmbeddedSignup,
        enableManualSignup,
        enableCoexistence,
        usingOwnMetaApp: ownAppReady,
        hasOwnMetaApp: !!(ownApp.appId || ownApp.configId),
        webhookUrl,
        webhookVerifyToken,
        features: ['WHATSAPP_EMBEDDED_SIGNUP'],
        version: 'v21.0',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/workspaces/:id/whatsapp/meta-app
// Lets a tenant use their own Meta developer app for Embedded Signup —
// no admin access required. Clear all fields to revert to the platform app.
const updateMetaAppConfig = async (req, res) => {
  try {
    const workspace = await resolveWorkspace(req);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    const appId = String(req.body.appId || '').trim();
    const appSecret = String(req.body.appSecret || '').trim();
    const configId = String(req.body.configId || '').trim();

    if ((appId || configId) && !appSecret && !workspace.whatsapp?.metaApp?.appSecret) {
      return res.status(400).json({
        success: false,
        message: 'App Secret is required when setting your own Meta app',
      });
    }

    workspace.whatsapp = workspace.whatsapp || {};
    workspace.whatsapp.metaApp = {
      appId,
      // Keep the existing secret when the field is left blank on update.
      appSecret: appSecret || workspace.whatsapp?.metaApp?.appSecret || '',
      configId,
    };
    await workspace.save();

    res.json({
      success: true,
      data: {
        hasOwnMetaApp: !!(appId || configId),
        appId: workspace.whatsapp.metaApp.appId,
        configId: workspace.whatsapp.metaApp.configId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/workspaces/:id/whatsapp/connection
// Tenant-facing view of the connection record (token never returned).
const getConnectionStatus = async (req, res) => {
  try {
    const workspace = await resolveWorkspace(req);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }
    const WhatsAppConnection = require('../models/WhatsAppConnection');
    const conn = await WhatsAppConnection.findOne({ tenant: workspace._id }).lean();
    res.json({
      success: true,
      data: conn || {
        tenant: workspace._id,
        connectionStatus: workspace.whatsapp?.isConnected ? 'connected' : 'disconnected',
        wabaId: workspace.whatsapp?.wabaId || '',
        phoneNumberId: workspace.whatsapp?.phoneNumberId || '',
        businessId: workspace.whatsapp?.businessAccountId || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/workspaces/:id/whatsapp/disconnect
const disconnectWhatsApp = async (req, res) => {
  try {
    const workspace = await resolveWorkspace(req);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    // Unsubscribe our app from the WABA so Meta stops delivering this tenant's events.
    const wa = workspace.whatsapp || {};
    if (wa.wabaId && wa.accessToken) {
      try {
        await axios.delete(`${META_GRAPH_URL}/${wa.wabaId}/subscribed_apps`, {
          headers: { Authorization: `Bearer ${wa.accessToken}` },
          timeout: 10000,
        });
      } catch (err) {
        console.error('[Disconnect] unsubscribe failed:', err.response?.data?.error?.message || err.message);
      }
    }

    workspace.whatsapp = {
      isConnected: false,
      connectionMethod: '',
      wabaId: '',
      phoneNumberId: '',
      businessAccountId: '',
      accessToken: '',
      phoneNumber: '',
      displayName: '',
      qualityRating: '',
      webhookSecret: workspace.whatsapp?.webhookSecret || '',
    };
    await workspace.save();

    await waConnection.setStatus(workspace._id, 'disconnected', 'disconnected by user', {
      accessToken: '',
      webhookSubscribed: false,
      tokenValid: false,
    });

    res.json({ success: true, message: 'WhatsApp disconnected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handleEmbeddedSignup, getEmbeddedSignupConfig, updateMetaAppConfig,
  getOAuthUrl, oauthCallback, getConnectionStatus, disconnectWhatsApp,
};
