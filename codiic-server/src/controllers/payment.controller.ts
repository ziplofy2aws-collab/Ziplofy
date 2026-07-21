import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { createPaymentRecord, findPaymentsByStoreId } from '../services/payment.service';
import { validatePaymentConfirmBody } from '../validation/paymentConfirm';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

const isDuplicateUtrError = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  'code' in err &&
  (err as { code: string }).code === 'DUPLICATE_UTR';

/**
 * POST /api/payments/confirm — store manual UPI confirmation (name, email, UTR) for a store + customer.
 * Response shape matches the standalone payment-gateway demo.
 */
export const confirmPayment = asyncErrorHandler(async (req: Request, res: Response) => {
  const parsed = validatePaymentConfirmBody(req.body);
  if (!parsed.ok || !parsed.values) {
    return res.status(400).json({
      ok: false,
      error: 'validation_failed',
      details: parsed.errors,
    });
  }

  try {
    const record = await createPaymentRecord(parsed.values);
    return res.status(201).json({
      ok: true,
      id: record.id,
      referenceId: record.referenceId,
    });
  } catch (err) {
    if (isDuplicateUtrError(err)) {
      return res.status(409).json({
        ok: false,
        error: 'duplicate_utr',
        message:
          'This UTR was already submitted for this store. Contact support if this is a mistake.',
      });
    }
    throw err;
  }
});

/**
 * GET /api/payments/store/:storeId — list all payment confirmation documents for a store (newest first).
 */
export const getPaymentsByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId?: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const payments = await findPaymentsByStoreId(storeId);
  return res.status(200).json({
    ok: true,
    data: payments,
    count: payments.length,
    message: payments.length ? 'Payments fetched' : 'No payments found for this store',
  });
});
