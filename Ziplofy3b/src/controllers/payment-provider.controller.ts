import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PaymentProvider } from '../models/payment-provider/payment-provider.model';
import {
  IBankTransferDetails,
  IUpiDetails,
  StorePaymentProvider,
} from '../models/payment-provider/store-payment-provider.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

function validateBankTransferDetails(bankDetails?: Partial<IBankTransferDetails>) {
  const bankName = bankDetails?.bankName?.trim();
  const accountNumber = bankDetails?.accountNumber?.trim();
  const ifscCode = bankDetails?.ifscCode?.trim().toUpperCase();

  if (!bankName) {
    throw new CustomError('Bank name is required', 400);
  }
  if (!accountNumber || !/^\d{9,18}$/.test(accountNumber)) {
    throw new CustomError('Valid bank account number is required (9–18 digits)', 400);
  }
  if (!ifscCode || !IFSC_REGEX.test(ifscCode)) {
    throw new CustomError('Valid IFSC code is required', 400);
  }

  return { bankName, accountNumber, ifscCode };
}

function validateUpiDetails(upiDetails?: Partial<IUpiDetails>) {
  const upiId = upiDetails?.upiId?.trim().toLowerCase();

  if (!upiId || !UPI_ID_REGEX.test(upiId)) {
    throw new CustomError('Valid UPI ID is required (e.g. name@paytm)', 400);
  }

  return { upiId };
}

export const getPaymentProviders = asyncErrorHandler(async (req: Request, res: Response) => {
  const { search, category, manual } = req.query as {
    search?: string;
    category?: string;
    manual?: string;
  };

  const filter: Record<string, unknown> = { isActive: true };

  if (manual === 'true') {
    filter.isManual = true;
  } else {
    filter.isManual = { $ne: true };
  }

  if (category && category !== 'all') {
    filter.category = category;
  }
  if (search?.trim()) {
    const term = search.trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { key: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
    ];
  }

  const providers = await PaymentProvider.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    data: providers,
    count: providers.length,
    message: 'Payment providers fetched successfully',
  });
});

export const getPaymentProviderByKey = asyncErrorHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const provider = await PaymentProvider.findOne({ key, isActive: true }).lean();
  if (!provider) throw new CustomError('Payment provider not found', 404);

  return res.status(200).json({
    success: true,
    data: provider,
    message: 'Payment provider fetched successfully',
  });
});

export const getStorePaymentProviders = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.query as { storeId?: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const connections = await StorePaymentProvider.find({ storeId })
    .sort({ createdAt: -1 })
    .lean();

  const providerKeys = connections.map((c) => c.providerKey);
  const providers = providerKeys.length
    ? await PaymentProvider.find({ key: { $in: providerKeys } }).lean()
    : [];

  const providerMap = new Map(providers.map((p) => [p.key, p]));
  const data = connections.map((connection) => ({
    ...connection,
    provider: providerMap.get(connection.providerKey) ?? null,
  }));

  return res.status(200).json({
    success: true,
    data,
    count: data.length,
    message: 'Store payment providers fetched successfully',
  });
});

export const connectStorePaymentProvider = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, providerKey, bankDetails, upiDetails } = req.body as {
    storeId?: string;
    providerKey?: string;
    bankDetails?: Partial<IBankTransferDetails>;
    upiDetails?: Partial<IUpiDetails>;
  };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  if (!providerKey?.trim()) {
    throw new CustomError('providerKey is required', 400);
  }

  const provider = await PaymentProvider.findOne({ key: providerKey.trim(), isActive: true });
  if (!provider) throw new CustomError('Payment provider not found', 404);

  const normalizedBankDetails =
    provider.key === 'bank_transfer' ? validateBankTransferDetails(bankDetails) : undefined;
  const normalizedUpiDetails =
    provider.key === 'upi_id' ? validateUpiDetails(upiDetails) : undefined;

  const existing = await StorePaymentProvider.findOne({ storeId, providerKey: provider.key });
  if (existing) {
    if (existing.status === 'active') {
      throw new CustomError('This payment provider is already connected', 409);
    }
    existing.status = 'active';
    existing.activatedAt = new Date();
    if (normalizedBankDetails) {
      existing.bankDetails = normalizedBankDetails;
    }
    if (normalizedUpiDetails) {
      existing.upiDetails = normalizedUpiDetails;
    }
    await existing.save();
    return res.status(200).json({
      success: true,
      data: existing,
      message: 'Payment provider reactivated successfully',
    });
  }

  const connection = await StorePaymentProvider.create({
    storeId,
    providerKey: provider.key,
    status: 'active',
    activatedAt: new Date(),
    ...(normalizedBankDetails ? { bankDetails: normalizedBankDetails } : {}),
    ...(normalizedUpiDetails ? { upiDetails: normalizedUpiDetails } : {}),
  });

  return res.status(201).json({
    success: true,
    data: connection,
    message: 'Payment provider connected successfully',
  });
});

export const disconnectStorePaymentProvider = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError('Invalid connection id', 400);
  }

  const deleted = await StorePaymentProvider.findByIdAndDelete(id);
  if (!deleted) throw new CustomError('Store payment provider connection not found', 404);

  return res.status(200).json({
    success: true,
    data: { deletedId: id },
    message: 'Payment provider disconnected successfully',
  });
});
