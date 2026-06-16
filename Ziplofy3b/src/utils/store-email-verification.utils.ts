import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const STORE_SENDER_EMAIL_VERIFICATION_PURPOSE = 'store_sender_email_verification';
export const STORE_SENDER_EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export interface StoreSenderEmailVerificationPayload {
  storeId: string;
  storeNotificationEmailId: string;
  email: string;
  purpose: typeof STORE_SENDER_EMAIL_VERIFICATION_PURPOSE;
}

export function getStoreEmailVerificationSecret(): string {
  const secret =
    process.env.STORE_EMAIL_VERIFICATION_SECRET ||
    process.env.JWT_SECRET ||
    process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error('Store email verification secret is not configured');
  }

  return secret;
}

export function hashVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createStoreSenderEmailVerificationToken(
  payload: Omit<StoreSenderEmailVerificationPayload, 'purpose'>
): string {
  const secret = getStoreEmailVerificationSecret();

  return jwt.sign(
    {
      ...payload,
      purpose: STORE_SENDER_EMAIL_VERIFICATION_PURPOSE,
    },
    secret,
    { expiresIn: '24h' }
  );
}

export function verifyStoreSenderEmailVerificationToken(
  token: string
): StoreSenderEmailVerificationPayload {
  const secret = getStoreEmailVerificationSecret();
  const decoded = jwt.verify(token, secret) as StoreSenderEmailVerificationPayload;

  if (decoded.purpose !== STORE_SENDER_EMAIL_VERIFICATION_PURPOSE) {
    throw new Error('Invalid verification token purpose');
  }

  if (!decoded.storeId || !decoded.storeNotificationEmailId || !decoded.email) {
    throw new Error('Invalid verification token payload');
  }

  return decoded;
}

export function getStoreSenderEmailVerificationExpiryDate(): Date {
  return new Date(Date.now() + STORE_SENDER_EMAIL_VERIFICATION_TTL_MS);
}
