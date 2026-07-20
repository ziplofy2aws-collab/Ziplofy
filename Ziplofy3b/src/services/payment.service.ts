import mongoose from 'mongoose';
import { Payment } from '../models/payment/payment.model';
import type { PaymentConfirmValues } from '../validation/paymentConfirm';

export async function findPaymentsByStoreId(storeId: string) {
  return Payment.find({ storeId: new mongoose.Types.ObjectId(storeId) })
    .sort({ createdAt: -1 })
    .lean()
    .exec();
}

export async function createPaymentRecord(data: PaymentConfirmValues): Promise<{ id: string; referenceId: string }> {
  try {
    const doc = await Payment.create({
      storeId: data.storeId,
      customerId: data.customerId,
      name: data.name,
      email: data.email,
      utr: data.utr,
      referenceId: data.referenceId,
      amountPaise: data.amountPaise ?? null,
      merchantName: data.merchantName ?? null,
      orderId: data.orderId ?? null,
    });
    return {
      id: doc._id.toString(),
      referenceId: doc.referenceId,
    };
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: number }).code === 11000) {
      const err = new Error('duplicate_utr');
      (err as { code?: string }).code = 'DUPLICATE_UTR';
      throw err;
    }
    throw e;
  }
}
