import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  DEFAULT_CHECKOUT_CUSTOMER_INFORMATION,
  type CheckoutCustomerInformation,
} from '@codiic/create-theme/checkout/checkout-form.types';
import { axiosi } from '../config/axios.config';

interface ApiResponse {
  success: boolean;
  data: CheckoutCustomerInformation;
  message?: string;
}

interface StorefrontCheckoutCustomerInformationContextType {
  customerInformation: CheckoutCustomerInformation;
  loadedStoreId: string | null;
  loading: boolean;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<CheckoutCustomerInformation>;
  clear: () => void;
}

const StorefrontCheckoutCustomerInformationContext = createContext<
  StorefrontCheckoutCustomerInformationContextType | undefined
>(undefined);

export const StorefrontCheckoutCustomerInformationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [customerInformation, setCustomerInformation] = useState<CheckoutCustomerInformation>(
    DEFAULT_CHECKOUT_CUSTOMER_INFORMATION
  );
  const [loadedStoreId, setLoadedStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef<Map<string, Promise<CheckoutCustomerInformation>>>(new Map());

  const clear = useCallback(() => {
    setCustomerInformation(DEFAULT_CHECKOUT_CUSTOMER_INFORMATION);
    setLoadedStoreId(null);
    setError(null);
    setLoading(false);
    inflightRef.current.clear();
  }, []);

  const fetchByStoreId = useCallback(
    async (storeId: string): Promise<CheckoutCustomerInformation> => {
      if (loadedStoreId === storeId) {
        return customerInformation;
      }

      const inflight = inflightRef.current.get(storeId);
      if (inflight) return inflight;

      const promise = (async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await axiosi.get<ApiResponse>(
            `/storefront/${storeId}/checkout-customer-information`
          );
          const data =
            res.data?.success && res.data.data
              ? { ...DEFAULT_CHECKOUT_CUSTOMER_INFORMATION, ...res.data.data }
              : DEFAULT_CHECKOUT_CUSTOMER_INFORMATION;
          setCustomerInformation(data);
          setLoadedStoreId(storeId);
          return data;
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
              ?.message ||
            (err as Error)?.message ||
            'Failed to load checkout customer information';
          setError(msg);
          setCustomerInformation(DEFAULT_CHECKOUT_CUSTOMER_INFORMATION);
          setLoadedStoreId(null);
          return DEFAULT_CHECKOUT_CUSTOMER_INFORMATION;
        } finally {
          setLoading(false);
          inflightRef.current.delete(storeId);
        }
      })();

      inflightRef.current.set(storeId, promise);
      return promise;
    },
    [loadedStoreId, customerInformation]
  );

  const value: StorefrontCheckoutCustomerInformationContextType = {
    customerInformation,
    loadedStoreId,
    loading,
    error,
    fetchByStoreId,
    clear,
  };

  return (
    <StorefrontCheckoutCustomerInformationContext.Provider value={value}>
      {children}
    </StorefrontCheckoutCustomerInformationContext.Provider>
  );
};

export function useStorefrontCheckoutCustomerInformation(): StorefrontCheckoutCustomerInformationContextType {
  const ctx = useContext(StorefrontCheckoutCustomerInformationContext);
  if (!ctx) {
    throw new Error(
      'useStorefrontCheckoutCustomerInformation must be used within StorefrontCheckoutCustomerInformationProvider'
    );
  }
  return ctx;
}
