import { Request } from 'express';
import jwt from 'jsonwebtoken';

export const STOREFRONT_UNLOCK_HEADER = 'x-storefront-unlock-token';

export type StorefrontUnlockPayload = {
  storeId: string;
  type: 'storefront_unlock';
};

export function signStorefrontUnlockToken(storeId: string): string {
  return jwt.sign({ storeId, type: 'storefront_unlock' }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
}

export function verifyStorefrontUnlockToken(token: string, storeId: string): boolean {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Partial<StorefrontUnlockPayload>;
    return decoded.type === 'storefront_unlock' && decoded.storeId === storeId;
  } catch {
    return false;
  }
}

export function extractStorefrontUnlockToken(req: Request): string | null {
  const headerValue = req.headers[STOREFRONT_UNLOCK_HEADER];
  if (typeof headerValue === 'string' && headerValue.trim()) {
    return headerValue.trim();
  }
  if (Array.isArray(headerValue) && headerValue[0]?.trim()) {
    return headerValue[0].trim();
  }
  return null;
}

export function isStorefrontUnlocked(req: Request, storeId: string): boolean {
  const token = extractStorefrontUnlockToken(req);
  if (!token) return false;
  return verifyStorefrontUnlockToken(token, storeId);
}
