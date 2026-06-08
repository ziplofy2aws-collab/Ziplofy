import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

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

interface ConfirmOkResponse {
  ok: true;
  id: string;
  referenceId: string;
}

interface ConfirmErrorResponse {
  ok: false;
  error?: string;
  details?: Record<string, string>;
  message?: string;
}

interface PaymentContextType {
  loading: boolean;
  error: string | null;
  confirmPayment: (payload: PaymentConfirmPayload) => Promise<{ id: string; referenceId: string }>;
  clearError: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

function extractConfirmErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: ConfirmErrorResponse }; message?: string };
  const data = e.response?.data;
  if (data) {
    if (data.error === 'validation_failed' && data.details && typeof data.details === 'object') {
      const parts = Object.entries(data.details).map(([k, v]) => `${k}: ${v}`);
      if (parts.length) return parts.join('; ');
    }
    if (typeof data.message === 'string' && data.message) return data.message;
    if (typeof data.error === 'string' && data.error) return data.error;
  }
  return e.message || 'Could not confirm payment';
}

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const confirmPayment = useCallback(async (payload: PaymentConfirmPayload) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosi.post<ConfirmOkResponse | ConfirmErrorResponse>('/payments/confirm', payload);
      const body = res.data;

      if (!body || (body as ConfirmErrorResponse).ok === false) {
        const msg = extractConfirmErrorMessage({ response: { data: body as ConfirmErrorResponse } });
        setError(msg);
        throw new Error(msg);
      }

      const okBody = body as ConfirmOkResponse;
      return { id: okBody.id, referenceId: okBody.referenceId };
    } catch (err) {
      const msg = extractConfirmErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: PaymentContextType = {
    loading,
    error,
    confirmPayment,
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

