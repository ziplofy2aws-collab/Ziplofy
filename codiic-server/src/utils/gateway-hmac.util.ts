import crypto from 'crypto';

function canonicalProvisionPayload(timestamp: string, body: Record<string, unknown>): string {
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

function signCanonical(secret: string, timestamp: string, body: Record<string, unknown>): string {
  return crypto.createHmac('sha256', secret).update(canonicalProvisionPayload(timestamp, body)).digest('hex');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function verifyGatewayHmac(
  secret: string,
  timestamp: string,
  body: Record<string, unknown>,
  signature: string
): boolean {
  const expected = signCanonical(secret, timestamp, body);
  return timingSafeEqualHex(expected, signature);
}

export function isFreshTimestamp(timestamp: string, maxSkewMs = 5 * 60 * 1000): boolean {
  const value = Number(timestamp);
  if (!Number.isFinite(value)) return false;
  return Math.abs(Date.now() - value) <= maxSkewMs;
}
