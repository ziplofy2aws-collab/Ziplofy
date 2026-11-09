const crypto = require('crypto');

function gatewayApiBase() {
  return String(process.env.GATEWAY_API_URL || 'http://127.0.0.1:3011/api').replace(/\/+$/, '');
}

function gatewaySecret() {
  return process.env.GATEWAY_SSO_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-gateway-sso-secret-change-me');
}

function canonicalProvisionPayload(timestamp, body) {
  return [
    String(timestamp),
    String(body.email || '').toLowerCase().trim(),
    String(body.name || '').trim(),
    String(body.businessName || '').trim(),
    String(body.industry || ''),
    String(body.industryKind || ''),
    String(body.selectedService || ''),
    String(body.platformUserId || ''),
  ].join('\n');
}

function signBody(timestamp, body) {
  return crypto
    .createHmac('sha256', gatewaySecret())
    .update(canonicalProvisionPayload(timestamp, body))
    .digest('hex');
}

/**
 * Push profile / workspace updates to gateway PlatformUser.
 * Best-effort — failures are logged, not thrown to the client.
 */
async function syncProfileToGateway(payload) {
  const secret = gatewaySecret();
  if (!secret) {
    console.warn('[gateway-sync] GATEWAY_SSO_SECRET missing — skip sync');
    return false;
  }
  const body = {
    email: payload.email || '',
    name: payload.name || '',
    businessName: payload.businessName || '',
    industry: '',
    industryKind: '',
    selectedService: 'website_builder',
    platformUserId: payload.platformUserId || '',
    phone: payload.phone,
    billingTaxId: payload.billingTaxId,
    billingAddress: payload.billingAddress,
    preferredTimezone: payload.preferredTimezone,
    preferredLanguage: payload.preferredLanguage,
    profileComplete: payload.profileComplete,
    productWorkspaceId: payload.productWorkspaceId,
    productStoreId: payload.productStoreId,
    launchPath: payload.launchPath,
  };
  const timestamp = String(Date.now());
  const signature = signBody(timestamp, body);
  try {
    const res = await fetch(`${gatewayApiBase()}/internal/sync-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Timestamp': timestamp,
        'X-Gateway-Signature': signature,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn('[gateway-sync] failed', res.status, data.message || '');
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[gateway-sync] error', err.message);
    return false;
  }
}

function resolveLaunchPath(user, workspaceCount) {
  const profileComplete = Boolean(user.featureOverrides?.profileComplete);
  if (!profileComplete) return '/client/manage-profile';
  if (!workspaceCount) return '/client/workspace';
  const industry = user.featureOverrides?.industry || '';
  const { launchPathFor } = require('./gatewayModules');
  return launchPathFor({
    industry,
    selectedModules: user.featureOverrides?.selectedModules || [],
  });
}

module.exports = { syncProfileToGateway, resolveLaunchPath, gatewayApiBase };
