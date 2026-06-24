import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type StorefrontCheckoutConfiguration = {
  storeId: string;
  checkoutConfig: Record<string, unknown>;
};

interface ApiResponse {
  success: boolean;
  data: StorefrontCheckoutConfiguration | null;
  message?: string;
}

interface StorefrontCheckoutConfigurationContextType {
  configuration: StorefrontCheckoutConfiguration | null;
  loadedStoreId: string | null;
  loading: boolean;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<StorefrontCheckoutConfiguration | null>;
  clear: () => void;
}

const StorefrontCheckoutConfigurationContext = createContext<
  StorefrontCheckoutConfigurationContextType | undefined
>(undefined);

export const StorefrontCheckoutConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [configuration, setConfiguration] = useState<StorefrontCheckoutConfiguration | null>(null);
  const [loadedStoreId, setLoadedStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef<Map<string, Promise<StorefrontCheckoutConfiguration | null>>>(new Map());

  const clear = useCallback(() => {
    setConfiguration(null);
    setLoadedStoreId(null);
    setError(null);
    setLoading(false);
    inflightRef.current.clear();
  }, []);

  const fetchByStoreId = useCallback(
    async (storeId: string): Promise<StorefrontCheckoutConfiguration | null> => {
      if (loadedStoreId === storeId && configuration) {
        return configuration;
      }

      const inflight = inflightRef.current.get(storeId);
      if (inflight) return inflight;

      const promise = (async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await axiosi.get<ApiResponse>(
            `/storefront/checkout-configuration/store/${storeId}`
          );
          const data = res.data?.success ? (res.data.data ?? null) : null;
          setConfiguration(data);
          setLoadedStoreId(storeId);
          return data;
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
              ?.message ||
            (err as Error)?.message ||
            'Failed to load checkout configuration';
          setError(msg);
          setConfiguration(null);
          setLoadedStoreId(null);
          return null;
        } finally {
          setLoading(false);
          inflightRef.current.delete(storeId);
        }
      })();

      inflightRef.current.set(storeId, promise);
      return promise;
    },
    [configuration, loadedStoreId]
  );

  const value: StorefrontCheckoutConfigurationContextType = {
    configuration,
    loadedStoreId,
    loading,
    error,
    fetchByStoreId,
    clear,
  };

  return (
    <StorefrontCheckoutConfigurationContext.Provider value={value}>
      {children}
    </StorefrontCheckoutConfigurationContext.Provider>
  );
};

export const useStorefrontCheckoutConfiguration = (): StorefrontCheckoutConfigurationContextType => {
  const ctx = useContext(StorefrontCheckoutConfigurationContext);
  if (!ctx) {
    throw new Error(
      'useStorefrontCheckoutConfiguration must be used within a StorefrontCheckoutConfigurationProvider'
    );
  }
  return ctx;
};
