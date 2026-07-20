import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { CheckoutPaymentMethodOption } from '@codiic/create-theme/checkout/checkout-form.types';
import { axiosi } from '../config/axios.config';

interface ApiResponse {
  success: boolean;
  data: CheckoutPaymentMethodOption[];
  count?: number;
  message?: string;
}

interface StorefrontPaymentMethodsContextType {
  paymentMethods: CheckoutPaymentMethodOption[];
  loadedStoreId: string | null;
  loading: boolean;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<CheckoutPaymentMethodOption[]>;
  clear: () => void;
}

const StorefrontPaymentMethodsContext = createContext<
  StorefrontPaymentMethodsContextType | undefined
>(undefined);

export const StorefrontPaymentMethodsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<CheckoutPaymentMethodOption[]>([]);
  const [loadedStoreId, setLoadedStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef<Map<string, Promise<CheckoutPaymentMethodOption[]>>>(new Map());

  const clear = useCallback(() => {
    setPaymentMethods([]);
    setLoadedStoreId(null);
    setError(null);
    setLoading(false);
    inflightRef.current.clear();
  }, []);

  const fetchByStoreId = useCallback(
    async (storeId: string): Promise<CheckoutPaymentMethodOption[]> => {
      if (loadedStoreId === storeId) {
        return paymentMethods;
      }

      const inflight = inflightRef.current.get(storeId);
      if (inflight) return inflight;

      const promise = (async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await axiosi.get<ApiResponse>(`/storefront/${storeId}/payment-methods`);
          const data = res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
          setPaymentMethods(data);
          setLoadedStoreId(storeId);
          return data;
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
              ?.message ||
            (err as Error)?.message ||
            'Failed to load payment methods';
          setError(msg);
          setPaymentMethods([]);
          setLoadedStoreId(null);
          return [];
        } finally {
          setLoading(false);
          inflightRef.current.delete(storeId);
        }
      })();

      inflightRef.current.set(storeId, promise);
      return promise;
    },
    [loadedStoreId, paymentMethods]
  );

  const value: StorefrontPaymentMethodsContextType = {
    paymentMethods,
    loadedStoreId,
    loading,
    error,
    fetchByStoreId,
    clear,
  };

  return (
    <StorefrontPaymentMethodsContext.Provider value={value}>
      {children}
    </StorefrontPaymentMethodsContext.Provider>
  );
};

export function useStorefrontPaymentMethods(): StorefrontPaymentMethodsContextType {
  const ctx = useContext(StorefrontPaymentMethodsContext);
  if (!ctx) {
    throw new Error('useStorefrontPaymentMethods must be used within StorefrontPaymentMethodsProvider');
  }
  return ctx;
}
