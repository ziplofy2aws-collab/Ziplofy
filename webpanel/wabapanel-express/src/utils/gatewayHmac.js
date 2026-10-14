const crypto = require('crypto');

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

function signCanonical(secret, timestamp, body) {
  return crypto.createHmac('sha256', secret).update(canonicalProvisionPayload(timestamp, body)).digest('hex');
}

function timingSafeEqualHex(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function verifyGatewayHmac(secret, timestamp, body, signature) {
  return timingSafeEqualHex(signCanonical(secret, timestamp, body), signature);
}

function isFreshTimestamp(timestamp, maxSkewMs = 5 * 60 * 1000) {
  const value = Number(timestamp);
  if (!Number.isFinite(value)) return false;
  return Math.abs(Date.now() - value) <= maxSkewMs;
}

function gatewaySecret() {
  return process.env.GATEWAY_SSO_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-gateway-sso-secret-change-me');
}

function assertGatewaySignature(req) {
  const secret = gatewaySecret();
  if (!secret) {
    const err = new Error('GATEWAY_SSO_SECRET is not configured');
    err.status = 500;
    throw err;
  }
  const timestamp = String(req.headers['x-gateway-timestamp'] || '');
  const signature = String(req.headers['x-gateway-signature'] || '');
  if (!isFreshTimestamp(timestamp) || !verifyGatewayHmac(secret, timestamp, req.body || {}, signature)) {
    const err = new Error('Invalid gateway signature');
    err.status = 401;
    throw err;
  }
}

module.exports = { verifyGatewayHmac, isFreshTimestamp, gatewaySecret, assertGatewaySignature };
