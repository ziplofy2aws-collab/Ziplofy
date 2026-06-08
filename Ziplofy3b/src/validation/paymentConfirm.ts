import mongoose from 'mongoose';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UTR_RE = /^\d{10,18}$/;

export interface PaymentConfirmValues {
  storeId: string;
  customerId: string;
  name: string;
  email: string;
  utr: string;
  referenceId: string;
  amountPaise: number | null;
  merchantName: string | null;
  orderId: string | null;
}

export function validatePaymentConfirmBody(body: unknown): {
  ok: boolean;
  errors: Record<string, string>;
  values: PaymentConfirmValues | null;
} {
  const errors: Record<string, string> = {};
  const b = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};

  const storeId = typeof b.storeId === 'string' ? b.storeId.trim() : '';
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    errors.storeId = 'Valid storeId is required';
  }

  const customerId = typeof b.customerId === 'string' ? b.customerId.trim() : '';
  if (!customerId || !mongoose.isValidObjectId(customerId)) {
    errors.customerId = 'Valid customerId is required';
  }

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (name.length < 2) errors.name = 'Name must be at least 2 characters';

  const email = typeof b.email === 'string' ? b.email.trim() : '';
  if (!EMAIL_RE.test(email)) errors.email = 'Invalid email address';

  const utrRaw = typeof b.utr === 'string' ? b.utr.replace(/\D/g, '') : '';
  if (!UTR_RE.test(utrRaw)) errors.utr = 'UTR must be 10–18 digits';

  const referenceId = typeof b.referenceId === 'string' ? b.referenceId.trim() : '';
  if (!referenceId) errors.referenceId = 'Missing payment reference';

  const amountPaise =
    typeof b.amountPaise === 'number' && Number.isFinite(b.amountPaise)
      ? Math.round(b.amountPaise)
      : null;

  const merchantName =
    typeof b.merchantName === 'string' ? b.merchantName.trim() : null;

  const orderId = typeof b.orderId === 'string' ? b.orderId.trim() : null;

  const ok = Object.keys(errors).length === 0;

  return {
    ok,
    errors,
    values: ok
      ? {
          storeId,
          customerId,
          name,
          email,
          utr: utrRaw,
          referenceId,
          amountPaise,
          merchantName: merchantName || null,
          orderId: orderId || null,
        }
      : null,
  };
}
