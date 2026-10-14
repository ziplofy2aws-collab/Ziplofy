const config = require('../config');
const { mintSsoTicket } = require('./jwt');
const { signCanonical } = require('./hmac');
const SsoTicket = require('../models/SsoTicket');

function resolveDestination(user) {
  if (user.industry === 'education') {
    return { destination: 'webpanel', launchPath: '/client/edtech/overview' };
  }
  if (user.industry === 'healthcare') {
    return { destination: 'webpanel', launchPath: '/client/clinic/queue' };
  }
  return { destination: 'webpanel', launchPath: '/client/dashboard' };
}

async function callProvision(url, body) {
  const timestamp = String(Date.now());
  const signature = signCanonical(config.ssoSecret, timestamp, body);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Gateway-Timestamp': timestamp,
      'X-Gateway-Signature': signature,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error || data.message || `Provision failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return data;
}

async function provisionProduct(user) {
  const { destination, launchPath } = resolveDestination(user);
  const payload = {
    email: user.email,
    name: user.name,
    businessName: user.businessName,
    industry: user.industry || '',
    industryKind: user.industryKind || '',
    selectedService: 'website_builder',
    selectedModules: Array.isArray(user.selectedModules) ? user.selectedModules : [],
    platformUserId: user._id.toString(),
  };

  const result = await callProvision(`${config.webpanelApiUrl}/internal/gateway/provision-vendor`, payload);

  user.destination = destination;
  user.selectedService = 'website_builder';
  user.launchPath = result.launchPath || launchPath;
  user.productUserId = String(result.productUserId || '');
  user.productWorkspaceId = String(result.productWorkspaceId || '');
  user.productStoreId = String(result.productStoreId || '');
  user.onboardingStatus = 'complete';
  await user.save();
  return user;
}

function ssoRedirectUrl(destination, ticket) {
  if (destination === 'codiic') {
    return `${config.codiicDashboardUrl}/sso?ticket=${encodeURIComponent(ticket)}`;
  }
  return `${config.webpanelAppUrl}/auth/sso?ticket=${encodeURIComponent(ticket)}`;
}

async function issueSsoRedirect(user) {
  if (user.onboardingStatus !== 'complete' || !user.destination || !user.productUserId) {
    throw new Error('User has not been provisioned yet');
  }
  const { token, jti } = mintSsoTicket({
    platformUserId: user._id.toString(),
    destination: user.destination,
    productUserId: user.productUserId,
    launchPath: user.launchPath,
  });
  await SsoTicket.create({
    jti,
    platformUserId: user._id,
    destination: user.destination,
    productUserId: user.productUserId,
    expiresAt: new Date(Date.now() + 60 * 1000),
  });
  return {
    destination: user.destination,
    launchPath: user.launchPath,
    ssoUrl: ssoRedirectUrl(user.destination, token),
  };
}

module.exports = {
  resolveDestination,
  provisionProduct,
  issueSsoRedirect,
};
