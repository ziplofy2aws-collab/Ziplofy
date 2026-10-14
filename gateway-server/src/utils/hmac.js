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
  return crypto
    .createHmac('sha256', secret)
    .update(canonicalProvisionPayload(timestamp, body))
    .digest('hex');
}

function timingSafeEqualHex(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function verifyCanonical(secret, timestamp, body, signature) {
  const expected = signCanonical(secret, timestamp, body);
  return timingSafeEqualHex(expected, signature);
}

module.exports = {
  canonicalProvisionPayload,
  signCanonical,
  timingSafeEqualHex,
  verifyCanonical,
};
