import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

/** Mirrors Ziplofy3b `PaymentConfirmValues` / POST /payments/confirm body. */
export interface PaymentConfirmPayload {
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

export interface PaymentConfirmResult {
  id: string;
  referenceId: string;
}

/** Lean payment document from GET /payments/store/:storeId (matches IPayment + timestamps). */
export interface PaymentDocument {
  _id: string;
  storeId: string;
  customerId: string;
  name: string;
  email: string;
  utr: string;
  referenceId: string;
  amountPaise: number | null;
  merchantName: string | null;
  orderId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ConfirmOkResponse {
  ok: true;
  id: string;
  referenceId: string;
}

interface ListOkResponse {
  ok: true;
  data: PaymentDocument[];
  count: number;
  message: string;
}

const extractAxiosErrorMessage = (err: unknown): string => {
  const e = err as { response?: { data?: Record<string, unknown> }; message?: string };
  const data = e?.response?.data;
  if (data && typeof data === 'object') {
    if (data.error === 'validation_failed' && data.details && typeof data.details === 'object') {
      const details = data.details as Record<string, string>;
      const parts = Object.entries(details).map(([k, v]) => `${k}: ${v}`);
      if (parts.length) return parts.join('; ');
    }
    if (typeof data.message === 'string' && data.message) return data.message;
    if (typeof data.error === 'string' && data.error) return data.error;
  }
  return e?.message || 'Request failed';
};

interface PaymentContextType {
  payments: PaymentDocument[];
  loading: boolean;
  error: string | null;
  /** POST /payments/confirm — manual UPI confirmation (aligned with payment.controller). */
  confirmPayment: (payload: PaymentConfirmPayload) => Promise<PaymentConfirmResult>;
  /** GET /payments/store/:storeId — newest first; updates `payments` state. */
  fetchByStoreId: (storeId: string) => Promise<PaymentDocument[]>;
  clear: () => void;
  clearError: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<PaymentDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setPayments([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const confirmPayment = useCallback(async (payload: PaymentConfirmPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<ConfirmOkResponse>('/payments/confirm', payload);
      const body = res.data;
      if (!body.ok || !body.id) throw new Error('Unexpected response from payments/confirm');
      const result: PaymentConfirmResult = { id: body.id, referenceId: body.referenceId };
      setPayments((prev) => {
        const optimistic: PaymentDocument = {
          _id: body.id,
          storeId: payload.storeId,
          customerId: payload.customerId,
          name: payload.name,
          email: payload.email,
          utr: payload.utr.replace(/\D/g, ''),
          referenceId: payload.referenceId,
          amountPaise: payload.amountPaise,
          merchantName: payload.merchantName,
          orderId: payload.orderId,
        };
        return [optimistic, ...prev.filter((p) => p._id !== body.id)];
      });
      return result;
    } catch (err: unknown) {
      const msg = extractAxiosErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByStoreId = useCallback(async (storeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<ListOkResponse>(`/payments/store/${encodeURIComponent(storeId)}`);
      const body = res.data;
      if (!body.ok || !Array.isArray(body.data)) {
        throw new Error(body.message || 'Failed to fetch payments');
      }
      const list = body.data.map((row) => ({
        ...row,
        _id: String(row._id),
        storeId: String(row.storeId),
        customerId: String(row.customerId),
      }));
      setPayments(list);
      return list;
    } catch (err: unknown) {
      const msg = extractAxiosErrorMessage(err);
      setError(msg);
      setPayments([]);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: PaymentContextType = {
    payments,
    loading,
    error,
    confirmPayment,
    fetchByStoreId,
    clear,
    clearError,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};

export const usePayment = (): PaymentContextType => {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayment must be used within a PaymentProvider');
  return ctx;
};

export default PaymentContext;
